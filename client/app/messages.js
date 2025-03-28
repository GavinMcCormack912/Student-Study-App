import React, { useCallback, useEffect, useState } from 'react';
import { throttle } from 'lodash';
import {
    View, Text, FlatList, TouchableOpacity, StyleSheet,
    ActivityIndicator, Modal, TextInput, Alert
} from 'react-native';
import { useFocusEffect, useNavigation, useRouter } from 'expo-router';
import Header from '../components/Header';
import { useTheme } from '../components/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCurrentUser } from './api/user';
import { MaterialIcons } from '@expo/vector-icons'; // Import icon library


import {
    getStudyGroups,
    createStudyGroup,
    deleteStudyGroup,
    editStudyGroupName,
    getStudyGroupsAll,
    addStudyGroupMembers,
    setNewMessageFlagForGroup,
    addAllMembersToUnopenedMessageGroup,
    removeMemberFromUnopenedMessageGroup,
    getMembersWithUnopenedMessages
} from './api/studygroup';
import group from "@/app/group"; // Server function calls, Ensure correct path


export default function Messages() {

    const router = useRouter();
    const { isDarkTheme } = useTheme();
    const [errorModalVisible, setErrorModalVisible] = useState(false);
    const [successModalVisible, setSuccessModalVisible] = useState(false);
    const [groupsAll, setGroupsAll] = useState([]);
    const [joinModalVisible, setJoinModalVisible] = useState(false);
    const [loading, setLoading] = useState(true);
    const [createModalVisible, setCreateModalVisible] = useState(false);
    const [groupName, setGroupName] = useState('');
    const [members, setMembers] = useState('');
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');
    const [groupToEdit, setGroupToEdit] = useState(null);
    const [newMessage, setNewMessage] = useState(false);
    const navigation = useNavigation();


    const [currToken, setToken] = useState(null); // State to store AsyncStorage data
    const [currUser, setUser] = useState(null); // State to store AsyncStorage data
    const [currEmail, setEmail] = useState(null); // State to store AsyncStorage data
    const [newGroupMessages, setNewGroupMessages] = useState({});
    const [groups, setGroups] = useState([]);
    const [notificationsEnabled, setNotificationsEnabled] = useState(false);

    const handler_removeMemberFromUnopenedMessageGroup = async (groupId) => {
        removeMemberFromUnopenedMessageGroup(groupId,currEmail);
    }

    const toggleNotifications = () => {
        setNotificationsEnabled(!notificationsEnabled);
    };

    // Fetch groups function
    const fetchGroups = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            const user = await getCurrentUser({ token });
            const email = user.data.email;

            const response = await getStudyGroups({ email });
            //console.log(response.data);
            if (Array.isArray(response.data)) {
                setGroups(response.data);
                //console.log(response)

                //Populate newGroup Message
                const messages = {};
                for (const group of response.data) {
                    const membersWithUnopenedMessages = await getMembersWithUnopenedMessages(group._id);
                    //console.log('Response for group', group._id, membersWithUnopenedMessages);
                    if (Array.isArray(membersWithUnopenedMessages.data.members) && !notificationsEnabled) {
                        const hasNewMessage = membersWithUnopenedMessages.data.members.includes(email);
                        messages[group._id] = hasNewMessage;
                    } else {
                        console.warn(`No array in 'members' for group ${group._id}, defaulting to false`);
                        messages[group._id] = false;
                    }
                }
                setNewGroupMessages(messages);

            } else {
                console.error("Data is not an array:", response.data);
            }


            if (token !== null) {
                setToken(token); // Set the fetched data to state
            } else {
                setToken('No data found'); // Handle case where there's no data
            }
            if (user !== null) {
                setUser(user); // Set the fetched data to state
            } else {
                setUser('No data found'); // Handle case where there's no data
            }
            if (email !== null) {
                setEmail(email); // Set the fetched data to state
            } else {
                setEmail('No data found'); // Handle case where there's no data
            }
        } catch (error) {
            console.log("Failed to fetch study groups:", error);
            //setErrorModalVisible(true);
            console.log("Returning Empty List");
            //setGroups([]); // Clear groups if the fetch fails
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const intervalId = setInterval(() => {
            fetchGroups();
        }, 1000); // 1000 milliseconds = 1 second

        return () => clearInterval(intervalId); // Cleanup interval on component unmount
    }, [fetchGroups]);

    const fetchGroupsAll = async () => {
        try {
            const response = await getStudyGroupsAll();
            console.log(response.data);
            if (Array.isArray(response.data)) {
                setGroupsAll(response.data);
            } else {
                console.error("Data is not an array:", response.data);
            }
        } catch (error) {
            console.log("Failed to fetch All study groups:", error);
            //setErrorModalVisible(true);
            console.log("Returning Empty List");
            setGroupsAll([]); // Clear groups if the fetch fails
        } finally {
            setLoading(false);
        }
    };

    // Create Study Group Function
    const handleCreateGroup = async () => {
        if (!groupName || !members) {
            Alert.alert('Error', 'Please enter a group name and at least one member.');
            return;
        }

        try {
            const memberArray = members.split(',').map(m => m.trim());
            const token = await AsyncStorage.getItem('token');
            const user = await getCurrentUser({ token });
            const email = user.data.email;
            memberArray.push(email);
            await createStudyGroup({ name: groupName, members: memberArray });
            Alert.alert('Success', 'Study group created successfully!');
            setCreateModalVisible(false);
            setSuccessModalVisible(true);
            setGroupName('');
            setMembers('');
            await fetchGroups(); // Refresh the study groups list
        } catch (error) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to create group');
            setErrorModalVisible(true);
        }
    };
    const handleDeleteGroup = async (groupId) => {
        console.log("Deleting:", groupId);
        try {
            // Call the delete function with the groupId
            await deleteStudyGroup(groupId);

            // Show success message
            Alert.alert('Success', 'Study group deleted successfully!');

            // Refresh the list of study groups
            await fetchGroups(); // Assuming this fetches the updated list of groups
        } catch (error) {
            // Show error message if deletion fails
            Alert.alert('Error', error.response?.data?.message || 'Failed to delete group');
            setErrorModalVisible(true);
        }
    };

    const setNewMessageFlag = async (groupId,flag) => {
        // try {
        //     console.log("groupID was", groupId);
        //
        //     if(groupId === -1){
        //         for (let group of groups) {
        //             const response = await setNewMessageFlagForGroup(group._id, false);
        //             if (response.status === 200) {
        //                 console.log(`New message flag for group ${group._id} set to false.`);
        //             } else {
        //                 console.error(`Failed to reset new message flag for group ${group._id}.`);
        //             }
        //         }
        //         setNewMessage(false);
        //     } else {
        //         const response = await setNewMessageFlagForGroup(groupId, flag);
        //         console.log("Setting New Message for Group");
        //         setNewMessage(false);
        //     }
        // } catch (error) {
        //     console.log("Could not Set new Message for Group");
        //}
    };

    const updateStudyGroupName = async (groupId, newName) => {
        if (!groupId || !newName) {
            Alert.alert('Error', 'Please enter a new group name .');
            return;
        }
        console.log("Editing Study Group Name");
        console.log("New name:", newName);
        try {
            // Create the payload for the edit request
            const requestBody = { name: newName };

            // Send the PATCH request to update the study group name
            const response = await editStudyGroupName(groupId, requestBody);

            console.log("Response:", response.data);

            // Check if the response contains the updated group information
            if (response.data && response.data.group) {
                console.log("Study group name updated successfully:", response.data.group);
                // Optionally, update local state here with the updated group
                // Example: setGroups(updatedGroups); or update the specific group in your state
            } else {
                console.error("Failed to update group name:", response.data);
                setErrorModalVisible(true);
            }
            // Refresh the list of study groups
            await fetchGroups(); // Assuming this fetches the updated list of groups
            setSuccessModalVisible(true);
        } catch (error) {
            console.log("Error occurred while updating study group:", error);
            //setErrorModalVisible(true);
        } finally {
            // Perform any cleanup or loading state reset if necessary
        }
    };

    return (
        <View style={[styles.container, isDarkTheme ? styles.darkBackground : styles.lightBackground]}>
            <Header />

            <View style={styles.headerContainer}>
                <Text style={[styles.title, isDarkTheme ? styles.darkText : styles.lightText]}>Study Groups and Messaging</Text>
                <View style={styles.buttonsContainer}>
                    <TouchableOpacity
                        style={styles.joinButton}
                        onPress={() => {
                            fetchGroupsAll();
                            setJoinModalVisible(true);
                        }}
                    >
                        <Text style={styles.joinButtonText}>Join Group</Text>
                    </TouchableOpacity>

                    {/* Notification toggle button */}
                    <TouchableOpacity
                        style={styles.toggleButton}
                        onPress={toggleNotifications}
                    >
                        <MaterialIcons
                            name={notificationsEnabled ? 'notifications-off' : 'notifications'}
                            size={20}
                            color="white"
                        />
                    </TouchableOpacity>
                </View>

                {newMessage && (
                    <TouchableOpacity style={styles.notificationIcon} onPress={() => setNewMessageFlag(-1,false)}>
                        <MaterialIcons name="notifications" size={30} color="red" />
                    </TouchableOpacity>
                )}
            </View>
            {loading ? (
                <ActivityIndicator size="large" color="#007AFF" />
            ) : (
                <FlatList
                    data={groups}
                    keyExtractor={(item) => item._id}
                    renderItem={({ item }) => (

                        <View style={styles.groupItem}>
                            {/* Group Item (Touchable for navigation) */}
                            <TouchableOpacity
                                style={newGroupMessages[item._id] ? styles.groupItemMessage : styles.groupItemNoMessage}  // Use the function to determine style
                                onPress={() => {
                                    setNewMessageFlag( item._id, false);
                                    handler_removeMemberFromUnopenedMessageGroup(item._id);
                                    navigation.navigate('group', { groupId: item._id } )
                                }}
                            >
                                <Text style={styles.groupText}>{item.name}</Text>
                            </TouchableOpacity>

                            {/* Edit Button */}
                            <TouchableOpacity
                                onPress={() => {
                                    setGroupToEdit(item); // Set the group being edited
                                    setEditModalVisible(true); // Open the edit modal
                                }}
                            >
                                <Text style={styles.editText}>Edit Name</Text>
                            </TouchableOpacity>
                            {/* Delete Button */}
                            <TouchableOpacity onPress={() => handleDeleteGroup(item._id)}>
                                <Text style={styles.deleteText}>Delete</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                />
            )}

            {/* Button to Open Create Modal */}
            <TouchableOpacity style={styles.button} onPress={() => setCreateModalVisible(true)}>
                <Text style={styles.buttonText}>Create New Group</Text>
            </TouchableOpacity>

            {/* Modal for Creating Group */}
            <Modal visible={createModalVisible} animationType="slide" transparent={true}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Create a Study Group</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Group Name"
                            value={groupName}
                            onChangeText={setGroupName}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Members (comma-separated emails)"
                            value={members}
                            onChangeText={setMembers}
                        />
                        <TouchableOpacity style={styles.button} onPress={handleCreateGroup}>
                            <Text style={styles.buttonText}>Create Group</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.cancelButton} onPress={() => setCreateModalVisible(false)}>
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Modal for Changing Group Name */}
            <Modal visible={editModalVisible} animationType="slide" transparent={true}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Edit Study Group Name</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="New Group Name"
                            value={newGroupName}
                            onChangeText={setNewGroupName}
                        />
                        <TouchableOpacity
                            style={styles.button}
                            onPress={() => {
                                if (groupToEdit) {
                                    updateStudyGroupName(groupToEdit._id, newGroupName);
                                }
                            }}
                        >
                            <Text style={styles.buttonText}>Save Changes</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.cancelButton} onPress={() => setEditModalVisible(false)}>
                            <Text style={styles.cancelButtonText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Modal for Joining Group  */}
            <Modal visible={joinModalVisible} animationType="slide" transparent={true}>
                <View style={[{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' }]}>
                    <View style={[{ width: '80%', backgroundColor: '#fff', borderRadius: 10, padding: 20 }, isDarkTheme ? styles.darkBackground : styles.lightBackground]}>
                        <Text style={[{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }, isDarkTheme ? styles.darkText : styles.lightText]}>Select a Study Group</Text>
                        {loading ? (
                            <ActivityIndicator size="large" color="#007AFF" />
                        ) : (
                            <FlatList
                                data={groupsAll}
                                keyExtractor={(item) => item._id}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={[{ padding: 10, borderBottomWidth: 1, borderBottomColor: '#ddd' }, isDarkTheme ? styles.darkText : styles.lightText]}
                                        onPress={async() => {
                                            // Handle group selection
                                            setGroupToEdit(item); // Set the group being edited
                                            console.log('Selected group:', item);
                                            const token = await AsyncStorage.getItem('token');
                                            const user = await getCurrentUser({ token });
                                            const email = user.data.email;
                                            await addStudyGroupMembers(item._id,email);
                                            fetchGroups();
                                            setJoinModalVisible(false);
                                        }}
                                    >
                                        <Text style={[{ fontSize: 16 }, isDarkTheme ? styles.darkText : styles.lightText]}>{item.name}</Text>
                                    </TouchableOpacity>
                                )}
                            />
                        )}
                        <TouchableOpacity onPress={() => setJoinModalVisible(false)} style={{ marginTop: 10, padding: 10, backgroundColor: '#ccc', borderRadius: 5 }}>
                            <Text>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/*Error Modal*/}
            <Modal visible={errorModalVisible} animationType="slide" transparent={true}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>There Was An Error Completing the Task</Text>
                        <TouchableOpacity style={styles.cancelButton} onPress={() => setErrorModalVisible(false)}>
                            <Text style={styles.cancelButtonText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/*Success Modal*/}
            <Modal visible={successModalVisible} animationType="slide" transparent={true}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Task Completed Successfully!</Text>
                        <TouchableOpacity style={styles.cancelButton} onPress={() => setSuccessModalVisible(false)}>
                            <Text style={styles.cancelButtonText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

// Styles
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-start', // Allow list to expand downward
        alignItems: 'stretch', // Let FlatList expand horizontally
        //padding: 15,
        paddingTop: 75, // Reduce top padding for more space
    },
    title: { fontSize: 28, fontWeight: 'bold', marginBottom: 15, padding: 15 },
    groupItem: {
        width: '100%', // Make items full width
        padding: 15,
        backgroundColor: '#D3D3D3',
        borderRadius: 8,
        marginVertical: 1,
        alignItems: 'LEFT',
        borderWidth: 2,
    },
    groupText: { fontSize: 18, padding:15},
    listContainer: { paddingLeft: 0 },
    button: {
        width: '100%',
        padding: 15,
        backgroundColor: '#007AFF',
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20, // Space above the button
    },
    buttonText: {
        fontSize: 18,
        color: '#fff',
        fontWeight: 'bold'
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        width: '80%',
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
        elevation: 5,
        justifyContent: 'space-between', // Ensure spacing between the buttons
        height: 'auto', // Allow height to adjust based on content
        paddingBottom: 20, // Add padding at the bottom to give space for the buttons
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10 },
    input: {
        width: '100%',
        padding: 10,
        borderWidth: 1,
        borderRadius: 5,
        marginBottom: 10,
    },
    cancelButton: {
        padding: 10,
        backgroundColor: 'red',
        borderRadius: 5,
        marginTop: 20, // Space between Create Group and Cancel button
        alignItems: 'center',
        width: '80%', // Ensure buttons have the same width
    },
    cancelButtonText: {
        color: '#fff',
        fontWeight: 'bold'
    },
    deleteText: {
        color: 'red',
        backgroundColor: 'grey',
        fontSize: 18,
        borderRadius: 5,
        borderWidth: 2,
        width: '10%',
    },
    editText: {
        fontSize: 18,
        borderRadius: 5,
        backgroundColor: 'grey',
        marginVertical: 1,
        borderWidth: 2,
        width: '10%',
    },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between', // Ensures spacing between the title and button
        paddingHorizontal: 10,
        marginBottom: 10,
    },
    joinButton: {
        backgroundColor: '#007AFF',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 5,
    },
    joinButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    /* Dark Mode */
    darkBackground: { backgroundColor: "#121212" },
    darkText: { color: "#F1F1F1" },
    darkModal: { backgroundColor: "#1E1E1E" },
    darkInput: { backgroundColor: "#333", borderColor: "#555", color: "#F1F1F1" 
    },
    /* Light Mode */
    lightBackground: { backgroundColor: "#FFFFFF" },
    lightText: { color: "#333" },
    lightModal: { backgroundColor: "white" },
    lightInput: { backgroundColor: "#FFF", borderColor: "#CCC", color: "#333" 
    },
    notificationIcon: {
        position: 'absolute',
        right: -40,
        top: 10,
        padding: 50
    },
    groupItemNoMessage: {
        backgroundColor: '#f8f8f8',  // Light background color for the group item
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderRadius: 8,  // Rounded corners for a button-like appearance
        marginBottom: 8,  // Spacing between items
        elevation: 2,  // Shadow for Android
        shadowColor: '#000',  // Shadow for iOS
        shadowOffset: { width: 0, height: 2 },  // Vertical shadow offset
        shadowOpacity: 0.1,  // Shadow opacity
        shadowRadius: 4,  // Shadow blur radius
    },
    groupItemMessage: {
        backgroundColor: '#e0f7fa',  // Light blue background color for the group item with a new message
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderRadius: 8,  // Rounded corners for a button-like appearance
        marginBottom: 8,  // Spacing between items
        elevation: 2,  // Shadow for Android
        shadowColor: '#000',  // Shadow for iOS
        shadowOffset: { width: 0, height: 2 },  // Vertical shadow offset
        shadowOpacity: 0.1,  // Shadow opacity
        shadowRadius: 4,  // Shadow blur radius
    },
    toggleButton: {
        backgroundColor: '#f1c40f', // Change the color as per your design
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 5,
        marginLeft: 10, // Add space between buttons
    },
    buttonsContainer: {
        flexDirection: 'row',     // Aligns buttons horizontally (side by side)
        alignItems: 'center',     // Ensures buttons are vertically centered
        justifyContent: 'center', // Aligns buttons in the center, or use 'flex-start' if you want them aligned to the left
        marginTop: 10,            // Adds space between title and buttons
    },

});


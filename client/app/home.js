import React, { useContext, useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import Header from '../components/Header';
import { AuthContext } from './AuthContext';

export default function Home() {
    const router = useRouter();
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user, logout } = useContext(AuthContext);

    // Simulated API call to fetch groups
    useEffect(() => {
        setGroups([
            { id: '1', name: 'CS Study Group' },
            { id: '2', name: 'Purdue Hackathon Team' },
            { id: '3', name: 'Networking Enthusiasts' },
        ]);
        setLoading(false); // Set loading to false immediately
    }, []);

    return (
        <View style={styles.container}>
            {/* Header with its own styles */}
            <Header />

            {/* Title for the page */}
            <Text style={styles.title}>{user.email}'s Classes</Text>

            {/* Bottom buttons container */}
            <View style={styles.bottomButtonsContainer}>
                <TouchableOpacity style={styles.bottomButton} onPress={() => router.push('/Notes')}>
                    <Text style={styles.buttonText}>Notes</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.bottomButton} onPress={() => router.push('/AddClass')}>
                    <Text style={styles.buttonText}>Add Class</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.bottomButton} onPress={() => router.push('/messages')}>
                    <Text style={styles.buttonText}>Messages</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'flex-start', alignItems: 'center', padding: 15, paddingTop: 100 },
    title: { fontSize: 28, fontWeight: 'bold', marginBottom: 15 },
    groupItem: {
        width: '80%',
        padding: 15,
        backgroundColor: '#D3D3D3',
        borderRadius: 8,
        marginVertical: 5,
        alignItems: 'center',
        borderWidth: 2,  // Add border to each group item
        //borderColor: '#005BB5',  // Border color
    },
    groupText: { fontSize: 18 },
    button: {
        backgroundColor: '#007AFF',
        padding: 12,
        borderRadius: 8,
        marginTop: 20,
    },
    buttonText: { color: '#fff', fontSize: 16 },
    bottomButtonsContainer: {
        position: 'absolute',
        bottom: 30,
        width: '100%',
        paddingHorizontal: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    bottomButton: {
        backgroundColor: '#007AFF',
        padding: 10,
        borderRadius: 5,
        flex: 1,
        marginHorizontal: 5,
        alignItems: 'center',
    },
    header: {
        width: '100%',
        height: 70,
        backgroundColor: '#007AFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    headerText: {
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold',
    },
    listContainer: {
        paddingLeft: 50,  // Move the list 50 units to the right (adjust the number as needed)
    },
});

import { Text } from 'react-native'
function CustomText(props){
    return(
        <>
        <Text style={{fontSize: 20}}>{props.title}</Text>
        </>
    )
}
export default CustomText
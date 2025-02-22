import { View,Text,StyleSheet,TouchableOpacity } from "react-native";

interface Props{
    label:string
    onPress?: () => void
}

const Button = (props: Props) => {
    const {label,onPress} = props

    return(
        <TouchableOpacity onPress={onPress} style={styles.button}>
            <Text style={styles.buttonlabel}>{label}</Text>
        </TouchableOpacity>
    )
}

const styles=StyleSheet.create({
    button:{
        backgroundColor:"#ffffff",
        borderColor:"#000000",
        borderRadius:4,
        alignSelf:"flex-start",
        marginBottom:24,
    },
    buttonlabel:{
        fontSize:16,
        lineHeight:32,
        color:"rgba(0,0,0,0.8)",
        paddingVertical:8,
        paddingHorizontal:24,
        borderRadius:4,
        fontWeight:"bold",
    }
})

export default Button
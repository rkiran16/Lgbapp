
const Alert = ({title, mssg, opt1, opt2, opt3, cancelable, action1, action2, action3}) => {
    return (
        Alert.alert(
            title,
            mssg,
            [
            {text: opt1, onPress: () => action1()},
            {text: opt2, onPress: () => action2(), style: 'cancel'},
            {text: opt3, onPress: () => action3()},
            ],
            { cancelable: cancelable }
        )
    )
}

export { Alert };
import { AsyncStorage } from 'react-native';

export const storeDataAsync = (props) => {
	if(props.user) {
		return AsyncStorage.setItem('user', props.user);
	} else if(props.acceptTerms) {
		return AsyncStorage.setItem('terms', props.acceptTerms);
	} else if(props.interest) {
		return AsyncStorage.setItem('interest', props.interest);
	} else if(props.tag) {
		return AsyncStorage.setItem('tag', props.tag);
	} else if(props.friendList) {
		return AsyncStorage.setItem('friendlist', props.friendList);
	} else if(props.cart) {
		return AsyncStorage.setItem('cart', props.cart);
	} else if(props.cardDetails) {
		return AsyncStorage.setItem('cardDetails', props.cardDetails);
	} else if (props.chat){
		return AsyncStorage.setItem('chat', props.chat);
	} else if (props.notification) {
		return AsyncStorage.setItem('notification', props.notification);
	} else if(props.storeLog) {
		return AsyncStorage.setItem('storelog', props.storeLog);
	} else if(props.token) {
		return AsyncStorage.setItem('token', props.token);
	} else if(props.photo) {
		return AsyncStorage.setItem('photo', props.token);
	} else {
	}
}

export const removeData = (props) => {
	return AsyncStorage.removeItem(props);
}

export const fetchDataAsync = (props) => {
	return AsyncStorage.getItem(props);
}

export const removeDataAsync = (props) => {
	return AsyncStorage.removeItem(props);
}

export const multiFetchDataAsync = (props) => {
	return AsyncStorage.multiGet([...props])
}
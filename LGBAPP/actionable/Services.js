import * as Permissions from 'expo-permissions';
import { Notifications } from 'expo';
import { AsyncStorage } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import * as DbSubmit from './Onboard';
import * as AA from '../store/actions/orders';
import moment from 'moment';

export const pushToken = async () => {
    let previousToken = await AsyncStorage.getItem('pushtoken');
    if(previousToken){
        return;
    } else {
        const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
        if(status !== "granted") {
            return;
        }
        console.log(status);
        let token = await Notifications.getExpoPushTokenAsync();
        console.log(token);
        if(token !== null || token !== undefined){
            try {
                const formData = new FormData();
                formData.append('pushToken', token);
                const resData = await DbSubmit.dbSubmitUrl('m/updatepushtokens', formData);
                if(resData && resData.message){
                    return await AsyncStorage.setItem('pushtoken', token);
                }
            }catch (err) {
                throw err;
            }
        } else {
            const err = new Error('Cannot Generate Token');
            err.status = '009' //Error code for token failure
            throw err;
        }
    }
}

const _handleRecievedNotifications = async(notifications) => {
    let nnt = [];
    if(!notifications) {
      return
    }
    try{
      nnt.push(notifications);
      let prevNotification = await AsyncStorage.getItem('notifications');
      prevNotification = await JSON.parse(prevNotification);
      if(!prevNotification || prevNotification.length<=0) {
        await AsyncStorage.setItem('notifications', JSON.stringify(nnt));
      }
      if(prevNotification.length >= 2) {
        await AsyncStorage.setItem('notifications', JSON.stringify(nnt));
      }else {
        await AsyncStorage.setItem('notifications', JSON.stringify([...prevNotification, ...nnt]));
      }
    }
    catch(err) {
      console.log(err)
    }
    console.log('tawakalitu');
    return notifications
}

export const handleNotifications = () => {
    this._notificationSubscription = Notifications.addListener(_handleRecievedNotifications);
    return;
}

export const checkNotification = async() => {
    let notifications = await AsyncStorage.getItem('notifications');
    notifications = await JSON.parse(notifications);
    return notifications;
}

export const grantContact = async() => {
    const { status } = await Permissions.askAsync(Permissions.CONTACTS);
    if (status === 'granted') {
        return true;
    } else {
        return false;
    }
}

export const contactChecks = async(x) => {
    let arr = [];
    x.map(el => {
        for(phNumber of el.phoneNumbers){
            if(!phNumber.number){
                continue;
            }
            arr.push(phNumber.number.replace(/[^0-9]/g,''))
        }
    });

    return arr;

}

export const checkDateOfBirth = (val) => {
    const currentDate = new Date(moment().format('YYYY-MM-DD'));
    const postedDate = new Date (val)
    const Subtracted = ((((currentDate - postedDate)/ (1000 * 3600 * 24))/365) * 100/100);
    if(Subtracted <= 15) {
      return;
    }
    return val;
}

export const profileInformation = async() => {
    let userInfo = await AsyncStorage.getItem('user');
    if(!userInfo || userInfo==='null') {
        return false;
    }
    userInfo = await JSON.parse(userInfo);
    let firstName, lastName, sex, dob, phonenumber, address, city, statey, zip, country, bizname, displayName, img;
    firstName = !userInfo.profile.fname? null : userInfo.profile.fname; 
    lastName= !userInfo.profile.lname ? null : userInfo.profile.lname;
    sex = !userInfo.profile.sex ? null : userInfo.profile.sex;
    dob = !userInfo.profile.dob ? null : userInfo.profile.dob;
    phonenumber = !userInfo.profile.phonenum ? null : !userInfo.profile.phonenum;
    address = !userInfo.profile.address ? null : userInfo.profile.address;
    city = !userInfo.profile.city ? null : userInfo.profile.city;
    statey = !userInfo.profile.state ? null : userInfo.profile.state._id;
    zip = !userInfo.profile.zip ? null : userInfo.profile.zip;
    country = !userInfo.profile.country ? null : userInfo.profile.country._id;
    bizname = !userInfo.profile.bizname ? null : userInfo.profile.bizname;
    displayName = !userInfo.profile.displayName ? null : userInfo.profile.displayName;
    img = !userInfo.profile.img || userInfo.profile.img.length <=0  ? null : `${DbSubmit.dbUrl}${userInfo.profile.img}`

    return({firstName, lastName, sex, dob, phonenumber, address, city, statey, zip, country, bizname, displayName, img});
}

export const grabStateData = (x,y) => {
    let filterCountry; let statey = [];
    if(!x || x.length <=0 || !y){
        return null
    }
    filterCountry = x.find(el => el._id === y);
    if(!filterCountry){
        return null;
    }
    filterCountry.states.map(el => statey.push({label: el.name, value: el._id}));
    return statey;
}

export const finalSubmission = async(y) => {
    const x = await profileInformation();
    const { img } = y;
    if(img && img.length > 0 && img !== x.img){
        try {
            const photoName = y.img[0].split('/');
            let pImage = y.img[0].split('.');
            pImage = y.img[0].split('.')[pImage.length -1];
            const photoImg = new Object();
            if(pImage === 'jpg'){
                photoImg.type = `image/${pImage}`;
            }
            else if(pImage === 'jpeg') {
                photoImg.type = `image/${pImage}`;
            }
            else if(pImage === 'png') {
                photoImg.type = `image/${pImage}`;
            } else {
                photoImg.type = `video/${pImage}`;
            }
            photoImg.uri = y.img[0];
            photoImg.name = y.img[0].split('/')[photoName.length -1];
            const formData = new FormData();
            formData.append('imgURL', photoImg);
            await DbSubmit.dbSubmitUrl('m/updateuserphoto', formData);
        }catch(err){
            throw err;
        }
    }
    
    let firstName, lastName, sex, dob, phonenumber, address, city, staty, zip, country, bizname;
    firstName = x.firstName !== y.firstName && y.firstName !=='' ? y.firstName : x.firstName;
    lastName = x.lastName !== y.lastName && y.lastName !=='' ? y.lastName : x.lastName;
    sex = x.sex !== y.sex && y.sex !=='' ? y.sex : x.sex;
    dob = x.dob !== y.dob && y.dob !=='' ? y.dob : x.dob;
    phonenumber = x.phonenumber !== y.phonenumber && y.phonenumber !=='' ? y.phonenumber : x.phonenumber
    address = x.address !== y.address && y.address !=='' ? y.address : x.address;
    city = x.city !== y.city && y.city !=='' ? y.city : x.city;
    staty = x.statey !== y.statey && y.statey !=='' && y.statey ? y.statey : x.statey;
    zip = x.zip !== y.zip && y.zip !=='' ? y.zip : x.zip;
    country = x.country !== y.country && y.country !=='' && y.country ? y.country : x.country;
    bizname = x.bizname !== y.bizname && y.bizname !=='' ? y.bizname : x.bizname;
    const formData = new FormData();
    formData.append('firstName', firstName || 'null');
    formData.append('lastName', lastName||'null');
    formData.append('sex', sex||'null');
    formData.append('dob', dob||'null');
    formData.append('phonenumber', phonenumber||'null');
    formData.append('address', address||'null');
    formData.append('city', city||'null');
    formData.append('statey', staty||'null');
    formData.append('zip', zip||'null');
    formData.append('country', country||'null');
    formData.append('bizname', bizname||'null');
    try{
        await DbSubmit.dbSubmitUrl('m/userprofileupdate', formData);
    }catch(err) {
        throw err
    }
    return

}

export const getPaymentData = async() => {
    let cardDetails, billing;
    try {
        cardDetails = await SecureStore.getItemAsync('cardDetails');
        billing = await SecureStore.getItemAsync('billing');
        if(cardDetails) {
            cardDetails = await JSON.parse(cardDetails);
        }
        if(billing){
            billing = await JSON.parse(billing);
        }
        return ({cardDetails, billing});
    } catch (e) {
        console.log(e);
    }
}

export const setPaymentData = async(x, y) => {
    const cardDetails = new Object();
    const billing = new Object();
    try {
        if(x){
            if(!x.address || !x.city || !x.state || !x.zip){
                return 'Missing Data'
            }
            billing.address = x.address;
            billing.city = x.city;
            billing.state = x.state;
            billing.zip = x.zip;
            await SecureStore.setItemAsync('billing',JSON.stringify(billing));
        }
        if(y){
            if(!y.cvv || !y.number || !y.type || !y.expiryM || !y.expiryY){
                return 'Missing Data'
            }
            cardDetails.currencytype = y.currencytype;
            cardDetails.cvv = y.cvv;
            cardDetails.number = y.number;
            cardDetails.type =y.type;
            cardDetails.expiryM = y.expiryM;
            cardDetails.expiryY = y.expiryY;
            await SecureStore.setItemAsync('cardDetails',JSON.stringify(cardDetails));
        }
        return true;
    } catch (e) {
        return false;
    }
}

export const deletePaymentData = async() => {
    try{
        await SecureStore.deleteItemAsync('cardDetails');
        await SecureStore.deleteItemAsync('billing');
        return true;
    }catch(err){
        return false
    }
}

export const miscInc = async() => {
    try{
        // AA.miscIncrease
        return true;
    }catch(err){
        return false
    }
}

export const viewItem = async(x) => {
    if(!x) {
        return false;
    }
    await AA.viewItem(x)
    return true;
}

export const addToCart = async(w,x,y) => {
    if(!x) {
        return false;
    }
    let xs = {...x, qty: 1, time: y}
    await w.addCartItem(xs);
    return true;
}
export const removeSelectedItem = async(w,x) => {
    if(!x) {
        return false;
    }
    await w.removeItem(x);
    return true;
}

export const allAlert = async(a,u, v, w, x, y, z) => {
    const alertCancel = {
            text: 'Cancel',
            onPress: () => { return },
            style: 'destructive',
    }
    return(
        a.alert(u, v, [
            {
                text: w,
                style: x,
                onPress: async() => {
                    if(!y){
                        return;
                    }
                    return y();
                }
            }, z==true ? alertCancel : ''
            
        ], {cancelable: false})
    )
};
export const allAlerts = async(a,u, v, w, x, y, z, b, c, d, e, f, options,vv) => {
    const others = {
        text: z,
        onPress: async() => { 
            if(!b){
                return;
            }
            return b(options,vv);
        },
        style: 'default',
    }
    const alertCancel = {
        text: e,
        onPress: () => { 
            if(!f){
                return;
            }
            return f(options,vv);
         },
        style: 'destructive',
    }
    return(
        a.alert(u, v, [
            {
                text: w,
                style: x,
                onPress: async() => {
                    if(!y){
                        return;
                    }
                    return y(options,vv);
                }
            }, c===true ? others : '' , d===true ? alertCancel : ''
            
        ], {cancelable: false})
    )
};

export const profileCheckMutual = async(x) =>{
    const formData = new FormData();
    formData.append('xcon', x._id);
    const resData = await DbSubmit.dbSubmitUrl('m/checkmutual', formData);
    if(!resData.result || resData.result.length <= 0){
        return ({connect: x});
    }
    const result = {...x, mutual:resData.result[0].mutual, accepted:resData.result[0].accepted, connID:resData.result[0]._id}
    return ({connect:result});
}

export const manageNumbers = data => {
    parseFloat(3.14159.toFixed(2));
    if(data >=999999999999){
      let rData = data/1000000000000;
      rData = parseFloat(rData.toFixed(2));
      return `${rData}T`;
    }
    else if(data >= 999999999) {
      let rData = data/1000000000;
      rData = parseFloat(rData.toFixed(2));
      return `${rData}B`;
    }
    else if(data >= 999999) {
      let rData = data/1000000;
      rData = parseFloat(rData.toFixed(2));
      return `${rData}M`;
    }
    else if(data >= 999) {
      let rData = data/1000;
      rData = parseFloat(rData.toFixed(2));
      return `${rData}K`;
    }
    else if(data <= 999) {
      return data;
    }
}


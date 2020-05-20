import { AsyncStorage } from 'react-native'

export const dbUrl = 'http://1611917f.ngrok.io';

export const dbSubmitUrl = async(url, formData) => {
    // console.log(formData)
    try {
        const value = await AsyncStorage.getItem('user');
        if (!value) {
            const error = new Error('No User Data Found');
            error.status = '000'
            throw error;
        }
        rToken = await JSON.parse(value);
        const response = await fetch(
            `${dbUrl}${url}`,
            {
                method: 'POST',
                body: formData,
                headers: {
                Accept: 'application/json',
                'Content-Type': 'multipart/form-data',
                Authorization: 'Bearer ' + rToken.stoken 
                }
            }
            );
        if (response.status !== 200) {
            if(response.status === 422) {
                const err = await response.json();
                const error = new Error(err.message);
                error.status = 2;
                throw error;
            }
            if(response.status === 429) {
                const error = new Error('Error! Try again after sometime');
                error.status = 3;
                throw error;
            }
            const err = await response.json();
            const error = new Error(err.message);
            error.status = 4;
            throw error;
        }
        if(response._bodyBlob.name === "postreview"){
            console.log('winning')
            return;
        }else {
            const resData = await response.json();
            if(!resData) {
                const error = new Error('Error');
                error.status = 5;
                throw error;
            }
            return resData;
        }
    }catch(err) {
        console.log(err);
        throw err;
    }
}

export const postURL = (data, body) => {
    return fetch(`${dbUrl}/${data}`,{
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    })
}
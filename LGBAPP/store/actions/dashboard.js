import { AsyncStorage } from 'react-native';
import openConn from 'socket.io-client';
import * as URL from '../../actionable/Onboard';
export const GET_DATA = 'GET_DATA';
export const STORE_CAT_SEARCH = 'STORE_CAT_SEARCH';
export const FILTERD_POST_CAT = 'FILTERD_POST_CAT';
export const OTHER_POST = 'OTHER_POST';
export const SIMILAR_POST = 'SIMILAR_POST';
export const COMMENTS_POST = 'COMMENTS_POST';
export const POST_REVIEW = 'POST_REVIEW';
export const SUBMIT_COMMENT = 'SUBMIT_COMMENT';
export const CAT_COMMENTS_POST = 'CAT_COMMENTS_POST';
export const SUBMIT_SAVE_POST = 'SUBMIT_SAVE_POST';
export const FETCH_SAVE_POST = 'FETCH_SAVE_POST';
export const GET_NOTIFICATIONS = 'GET_NOTIFICATIONS';
export const REMOVE_NOTIFICATIONS = 'REMOVE_NOTIFICATIONS';
export const COMPARE_CONTACTS = 'COMPARE_CONTACTS';
export const PHOTO_UPLOAD = 'PHOTO_UPLOAD';
export const REMOVE_SAVED_POST = 'REMOVE_SAVED_POST';
export const STORE_VIEW = 'STORE_VIEW';
export const FOUND_SCHEDULE = 'FOUND_SCHEDULE'
export const RFOUND_SCHEDULE = 'RFOUND_SCHEDULE';
export const APP_STATE = 'APP_STATE';
export const NEW_CONN = 'NEW_CONN';
export const NEW_CONN_UPDATE = 'NEW_CONN_UPDATE';
export const IS_TYPING = 'IS_TYPING';
export const NEW_MESSAGE = 'NEW_MESSAGE';
export const REMOVE_SOCKET_UPDATE = 'REMOVE_SOCKET_UPDATE';

let sconnection;
export const fetchData = (pager) => {
    let rToken,catMenu
    return async dispatch => {
      try {
        const value = await AsyncStorage.getItem('user');
        if (!value) {
          throw new Error('Something went wrong!');
        }
        rToken = await JSON.parse(value);
        const id = !rToken.profile._id ? null : rToken.profile._id
        let interest = !rToken.profile.interest ? null : rToken.profile.interest;
        interest = JSON.stringify(interest);

        const formData = new FormData();
        formData.append('id', id);
        formData.append('interest', interest);
        formData.append('page', pager);

        const response = await fetch(
            `${URL.dbUrl}m/dashboardprefill`, {
                method: 'POST',
                body: formData,
                headers: {
                    Authorization: 'Bearer ' + rToken.stoken
                }
            }
        );

        if (response.status !== 200) {
            console.log(response);
            if(response.status === 304) {
                return;
            } else {
                const message = 'An error occured';
                const error = new Error(message);
                error.status = response.status;
                throw error;
            }
        }

        const resData = await response.json();
        if (!resData || resData === undefined || resData===null || typeof resData !== 'object' || !resData.category) {
            const message = 'Internal error. Check connection and try again!';
            const error = new Error(message);
            throw error;
        }

        const rInterest = resData.category.filter(x => rToken.profile.interest.find(y => x._id === y)); //;
        const rKommonKat = resData.category.filter(x => resData.commonCat.find(y => x._id === y.name));
        let pushInt
        if(!rInterest || rInterest.length <= 0) {
            catMenu = rInterest;
        } else {
            if(rInterest.length >= 7) {
                catMenu = rInterest;
            }
            else if(rInterest.length === 6) {
                pushInt = rKommonKat.filter(x => !rInterest.find(y => x._id === y._id));
                catMenu = rInterest;
                catMenu.push(pushInt[0])
            }
            else if(rInterest.length === 5) {
                pushInt = rKommonKat.filter(x => !rInterest.find(y => x._id === y._id));
                catMenu = rInterest;
                catMenu.push(pushInt[0],pushInt[1]);
            }
            else if(rInterest.length === 4) {
                pushInt = rKommonKat.filter(x => !rInterest.find(y => x._id === y._id));
                catMenu = rInterest;
                catMenu.push(pushInt[0],pushInt[1],pushInt[2]);
            }
            else if(rInterest.length === 3) {
                pushInt = rKommonKat.filter(x => !rInterest.find(y => x._id === y._id));
                catMenu = rInterest;
                catMenu.push(pushInt[0],pushInt[1],pushInt[2],pushInt[3]);
            }
            else if(rInterest.length === 2) {
                pushInt = rKommonKat.filter(x => !rInterest.find(y => x._id === y._id));
                catMenu = rInterest;
                catMenu.push(pushInt[0],pushInt[1],pushInt[2],pushInt[3],pushInt[4]);
            }
            else if(rInterest.length === 1) {
                pushInt = rKommonKat.filter(x => !rInterest.find(y => x._id === y._id));
                catMenu = rInterest;
                catMenu.push(pushInt[0],pushInt[1],pushInt[2],pushInt[3],pushInt[4],pushInt[5]);
            }
            else if(rInterest.length <= 0) {
                catMenu = rKommonKat;
            }
        }

        dispatch({ type: GET_DATA, category:resData.category, 
            commonCategory:rKommonKat, post:resData.posts, 
            promoPost:resData.promoPost, catMenu: catMenu, 
            tags:resData.tags, status:response.status});
      } catch (err) {
            console.log(err);
        throw err;
      }
    };
};

export const storedSearches = (data) =>{
    return dispatch => {
      dispatch({type: STORE_CAT_SEARCH, 
      storedSearch: !data.length ? null : data,
    })
    }
};

export const storeView = (data) =>{
    return dispatch => {
      dispatch({type: STORE_VIEW, 
      data: !data ? null : data,
    })}
};

export const filterPosts = (pager, cat) => {
    console.log('timaya: '+pager);
    return async dispatch => {
      // any async code you want!
        try {
            const formData = new FormData();
            formData.append('pager', pager);
            formData.append('cat', cat);
            const resData = await URL.dbSubmitUrl('m/filterposts', formData);
            if(!resData){
                dispatch({ type: FILTERD_POST_CAT, error: true, data:[], item:cat });
            }
            dispatch({ type: FILTERD_POST_CAT, error: false, data:resData.posts, totalFilteredPost:resData.totalItems, item:cat});
        } catch (err) {
            console.log('kawak1');
            throw err;
        }
    };
};

export const findSimilarPost = (pager, cat, current) => {
    console.log(cat);
    return async dispatch => {
      // any async code you want!
        try {
            const formData = new FormData();
            formData.append('pager', pager);
            formData.append('cat', cat);
            const resData = await URL.dbSubmitUrl('m/filterposts', formData);
            if(!resData){
                dispatch({ type: SIMILAR_POST, error: true, data:[], item:cat, current:current });
            }
            dispatch({ type: SIMILAR_POST, error: false, data:resData.posts, item:cat, current: current});
        } catch (err) {
            console.log('kawak21');
            throw err;
        }
    };
};

export const productComments = (pager, cat) => {
    return async dispatch => {
      // any async code you want!
        try {
            const formData = new FormData();
            formData.append('pager', pager);
            formData.append('cat', cat);
            const resData = await URL.dbSubmitUrl('m/fetchcomments', formData);
            if(!resData){
                dispatch({ type: COMMENTS_POST, error: true, data:[], item:cat});
            }
            dispatch({ type: COMMENTS_POST, error: false, data:resData.comment, item:cat});
        } catch(err) {
            throw err;
        }
    };
};

export const showCategoryPostComment = (pager, cat) => {
    return async dispatch => {
      // any async code you want!
        try {
            const formData = new FormData();
            formData.append('pager', pager);
            formData.append('cat', cat);
            const resData = await URL.dbSubmitUrl('m/fetchcomments', formData);
            if(!resData){
                dispatch({ type: CAT_COMMENTS_POST, error: true, data:[], item:cat});
            }
            dispatch({ type: CAT_COMMENTS_POST, error: false, data:resData.comment, item:cat});
        } catch(err) {
            throw err;
        }
    };
};

export const productReviews = (pager, cat) => {
    console.log(cat);
    console.log('fetching reviews');
    return async dispatch => {
      // any async code you want!
      try {
          const formData = new FormData();
          formData.append('pager', pager);
          formData.append('cat', cat);
          const resData = await URL.dbSubmitUrl('m/fetchreviews', formData);
          console.log('finishedfetchingreviews')
          dispatch({ type: POST_REVIEW, data:resData.review, item:cat, total:resData.totalItems});
      } catch (err) {
          throw err;
      }
    };
  };

export const submitTextComment = (post,comment) => {
    return async dispatch => {
      // any async code you want!
        try {
            const formData = new FormData();
            formData.append('text', comment);
            formData.append('post', post);
            const resData = await URL.dbSubmitUrl('m/submitcomments', formData);
            if(!resData){
                dispatch({ type: SUBMIT_COMMENT,error: true,data:[],item:post});
            }
            dispatch({ type: SUBMIT_COMMENT,error: false,item:post});
        } catch (err) {
            throw err;
        }
    };
};

export const savePostingItem = (post) => {
    return async dispatch => {
      // any async code you want!
        try {
            const formData = new FormData();
            formData.append('post', post);
            const resData = await URL.dbSubmitUrl('m/submitsavedpost', formData);
            if(!resData){
                dispatch({ type: SUBMIT_SAVE_POST,error: true,data:[]});
            }
            dispatch({ type: SUBMIT_SAVE_POST,error: false, data:resData.posts});
        } catch (err) {
            throw err;
        }
    };
};

export const getNotifications = () => {
    return async dispatch => {
      // any async code you want!
        try {
            const formData = new FormData();
            formData.append('post', 'notifications');
            const resData = await URL.dbSubmitUrl('m/fetchnotifications', formData);
            if(!resData){
                dispatch({ type: GET_NOTIFICATIONS,data:[]});
            }
            dispatch({ type: GET_NOTIFICATIONS, data:resData.notificate});
        } catch (err) {
            throw err;
        }
    };
};

export const fetchSavedItem = () => {
    return async dispatch => {
        try {
            const formData = new FormData();
            formData.append('nothing', 'na');
            const resData = await URL.dbSubmitUrl('m/fetchsavedpost', formData);
            if(!resData){
                return;
            }
            dispatch({ type: FETCH_SAVE_POST, data:resData.posts});
        } catch (err) {
            throw err;
        }
    };
};

export const removedSavedItem = (x) => {
    return async dispatch => {
        try {
            const formData = new FormData();
            formData.append('item', x);
            const resData = await URL.dbSubmitUrl('m/removesavedpost', formData);
            if(!resData){
                return;
            }
            dispatch({ type: REMOVE_SAVED_POST, data:x});
        } catch (err) {
            throw err;
        }
    };
};

export const removeNotifications = (cat) => {
    return async dispatch => {
      // any async code you want!
        try {
            const formData = new FormData();
            formData.append('cat', cat);
            const resData = await URL.dbSubmitUrl('m/removenotifications', formData);
            if(!resData){
                dispatch({ type: REMOVE_NOTIFICATIONS });
            }
            dispatch({ type: REMOVE_NOTIFICATIONS });
        } catch (err) {
            throw err;
        }
    };
};

export const compareContact = (cat) => {
    return async dispatch => {
      // any async code you want!
        try {
            const formData = new FormData();
            formData.append('cat', JSON.stringify(cat));
            const resData = await URL.dbSubmitUrl('m/comparecontacts', formData);
            if(!resData){
                dispatch({ type: COMPARE_CONTACTS, data:[] });
            }
            dispatch({ type: COMPARE_CONTACTS, data:resData.contacts });
        }catch (err) {
            throw err;
        }
    };
};

export const inviteMyFriend = (cat) => {
    return async dispatch => {
      // any async code you want!
        try {
            const formData = new FormData();
            formData.append('cat', JSON.stringify(cat));
            const resData = await URL.dbSubmitUrl('m/invitefriends', formData);
            if(!resData){
                return;
            }
            return;
        }catch (err) {
            throw err;
        }
    };
};

export const confirmSchedule = (x, y) => {
    return async dispatch => {
      // any async code you want!
        try {
            const formData = new FormData();
            formData.append('date', JSON.stringify(x));
            formData.append('seller', JSON.stringify(y));
            const resData = await URL.dbSubmitUrl('m/confirmschedule', formData);
            if(!resData){
                dispatch({ type: FOUND_SCHEDULE, data:[] });
            }
            dispatch({ type: FOUND_SCHEDULE, data:resData.sch });
        }catch (err) {
            throw err;
        }
    };
};

export const removeSchedules = () =>{
    return dispatch => {
      dispatch({type: RFOUND_SCHEDULE, data: null });
    }
};

export const appStateMgt = (x) =>{
    console.log(x);
    return dispatch => {
      dispatch({type: APP_STATE, data: x });
    }
};

export const getAllImageSubmit = (x, y) => {
    let images
    return async dispatch => {
      // any async code you want!
        try {
            if(!x || x.length <=0) {
                dispatch({ type: PHOTO_UPLOAD, photos:[], otherData:null});
                return;
            }
            images = x.map(el => el.uri)
            dispatch({ type: PHOTO_UPLOAD, photos:images, otherData:y});
        }catch (err) {
            throw err;
        }
    };
};

export const productPageOtherPosts = (pager, user, item) => {
    return async dispatch => {
      // any async code you want!
        try {
            const formData = new FormData();
            formData.append('user', user);
            const resData = await URL.dbSubmitUrl(`m/friendprefillconnect?page=${pager}`, formData, pager);
            if(!resData){
                dispatch({ type: OTHER_POST, error: true, data:[], user:user, item:item });
            }
            dispatch({ type: OTHER_POST, error: false, data:resData.posts, user:user, item:item});
        } catch (err) {
            throw err;
        }
    };
};

export const removeSocketUpdate = () =>{
    return dispatch => {
      dispatch({type: REMOVE_SOCKET_UPDATE})
    }
};



export const openSocket =() => {
    return dispatch => {
        sconnection = openConn.connect(URL.dbUrl);
        if(sconnection){
            sconnection.on('NewConnect', function(msg) {
                console.log('NewConnect');
                if(msg.action === 'NewConnect'){
                    let uid = guidGenerator();
                    const data = {...msg.data, uid:uid}
                    dispatch({ type: NEW_CONN, data: data});
                }
            })

            sconnection.on('ConnectUpdate', function(msg) {
                console.log('ConnectUpdate');
                if(msg.action === 'ConnectUpdate'){
                    let uid = guidGenerator();
                    const data = {...msg.data, uid:uid}
                    dispatch({ type: NEW_CONN_UPDATE, data: data});
                }
            })

            sconnection.on('isTyping', function(msg) {
                console.log('isTyping');
                if(msg.action === 'isTyping'){
                    dispatch({ type: IS_TYPING, data: msg.data.user});
                }
            })

            sconnection.on('NewMessage', function(msg) {
                console.log('NewMessage');
                if(msg.action === 'NewMessage'){
                    dispatch({ type: NEW_MESSAGE, data: msg.data.data, notify: msg.data.text, conn: msg.data.conn,});
                }
            })
        }
    } 
}

export const updateSocket = () => {
    return async dispatch => {
      // any async code you want!
        try {
            if(sconnection){
                const chek = sconnection.id;
                console.log(chek)
                const formData = new FormData();
                formData.append('scheck', chek);
                await URL.dbSubmitUrl('m/updateusersocket', formData);
            } else {
                const err = new Error('Connection Error')
                throw err;
            }
        }catch (err) {
            console.log(err)
            throw err;
        }
    };
};

// export const checkSockets = () => {
//     return async dispatch => {
//         if(sconnection){
//             sconnection.on('NewConnect', function(msg) {
//                 console.log('NewConnect');
//                 if(msg.action === 'NewConnect'){
//                     let uid = guidGenerator();
//                     const data = {...msg.data, uid:uid}
//                     dispatch({ type: NEW_CONN, data: data});
//                 }
//             })

//             sconnection.on('ConnectUpdate', function(msg) {
//                 console.log('NewConnect');
//                 if(msg.action === 'ConnectUpdate'){
//                     let uid = guidGenerator();
//                     const data = {...msg.data, uid:uid}
//                     dispatch({ type: NEW_CONN_UPDATE, data: data});
//                 }
//             })
//         }
//     }
// }


const guidGenerator = () => {
    var S4 = function() {
       return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
    };
    return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
};




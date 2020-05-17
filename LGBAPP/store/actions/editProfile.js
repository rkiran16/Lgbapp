import { AsyncStorage } from 'react-native';
import * as URL from '../../actionable/Onboard';
export const EDIT_USER = 'EDIT_USER';
export const GET_COUNTRY = 'GET_COUNTRY';
export const CHECK_USERNAME = 'CHECK_USERNAME';
export const GET_CURRENT_USER = 'GET_CURRENT_USER';
export const SEARCH_USER = 'SEARCH_USER';
export const FOLLOWER_SEARCH = 'FOLLOWER_SEARCH';
export const FOLLOWING_SEARCH = 'FOLLOWING_SEARCH';
export const ALL_CONNECTIONS = 'ALL_CONNECTIONS';
export const EMPTY_SEARCH = 'EMPTY_SEARCH';
export const MANAGED_PROFILE_STATES = 'MANAGED_PROFILE_STATES';
export const FRIEND_PREFILL = 'FRIEND_PREFILL';
export const EMPTY_FRIEND_PREFILL = 'EMPTY_FRIEND_PREFILL';
export const UPDATE_DESC = 'UPDATE_DESC';
export const CREATE_CONN = 'CREATE_CONN';
export const UPDATE_CONN = 'UPDATE_CONN';
export const EMPTY_CONN = 'EMPTY_CONN';
export const CHAT_MESSAGES = 'CHAT_MESSAGES';
export const SET_CURRENT_CHAT = 'SET_CURRENT_CHAT';


export const fetchCountry = () => {
    let rToken
    return async dispatch => {
      // any async code you want!
      try {
        const value = await AsyncStorage.getItem('user');
        if (!value) {
          throw new Error('Something went wrong!');
        }
        rToken = await JSON.parse(value);

        const response = await fetch(
            `${URL.dbUrl}m/countryprefill`, {
                method: 'POST',
                headers: {
                    Authorization: 'Bearer ' + rToken.stoken
                }
            }
        );
  
        if (response.status !== 200) {
          throw new Error('Something went wrong!');
        }
  
        const resData = await response.json();

        dispatch({ type: GET_COUNTRY, country: resData.country, category: resData.category, commonCategory: resData.commonCat });
      } catch (err) {
            console.log(err);
        throw err;
      }
    };
};

export const updateUser = (fdata, finterest) => {
  let rToken;
  const selInterest = [];
  finterest.map(el => selInterest.push(el._id));
  const photoName = fdata.photo.split('/');
  let pImage = fdata.photo.split('.');
  pImage = fdata.photo.split('.')[pImage.length -1];
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

  photoImg.uri = fdata.photo;
  // photoImg.name = fdata.photo.split('/')[photoName.length -1];
  photoImg.name = "2019-08-31T19_10_38.769Z-icon.png"
  const formData = new FormData();
  formData.append('imgURL', photoImg);
  formData.append('displayName', fdata.displayName);
  formData.append('fname', fdata.firstName);
  formData.append('lname', fdata.lastName);
  formData.append('bizname', fdata.bizname);
  formData.append('dob', fdata.dob);
  formData.append('country', fdata.country);
  formData.append('state', fdata.state);
  formData.append('zip', fdata.zipcodes);
  formData.append('city', fdata.city);
  formData.append('interest', JSON.stringify(selInterest));

  return async dispatch => {
    // any async code you want!
    try {
      const value = await AsyncStorage.getItem('user');
      if (!value) {
        throw new Error('Something went wrong!');
      }
      rToken = await JSON.parse(value);
      const response = await fetch(
        `${URL.dbUrl}m/existinguser`,
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
        const resp = await response.json();
        const error = new Error(resp.message);
        error.status = response.status;
        throw error;
      }

      const resData = await response.json();
      await AsyncStorage.removeItem('user');
      await AsyncStorage.setItem('user', JSON.stringify(resData));

      dispatch({ type: EDIT_USER, user: resData.profile });
    } catch (err) {
      throw err;
    }
  };
};

export const checkUsername = (displayName) => {
    let rToken;
    const formData = new FormData();
    formData.append('displayName', displayName);
    return async dispatch => {
      // any async code you want!
      try {
        const value = await AsyncStorage.getItem('user');
        if (!value) {
          throw new Error('Something went wrong!');
        }
        rToken = await JSON.parse(value);
        const response = await fetch(
          `${URL.dbUrl}m/checkusername`,
          {
            method: 'POST',
            body: formData,
            headers: {
              Authorization: 'Bearer ' + rToken.stoken
            }
            
          }
        );
        if (response.status !== 200) {
          throw new Error('Something went wrong!');
        }
  
        const resData = await response.json();

        dispatch({ type: CHECK_USERNAME, displayName: resData.message });
      } catch (err) {
        err.status = 502;
        throw err;
      }
    };
};


export const submitDescription = (token,desc) => {
  const formData = new FormData();
  formData.append('desc', desc);
  return async dispatch => {
    // any async code you want!
    try {
      const response = await fetch(
        `${URL.dbUrl}m/updateuserdesc`,
        {
          method: 'POST',
          body: formData,
          headers: {
            Authorization: 'Bearer ' + token
          }
        }
      );
      if (response.status !== 200) {
        throw new Error('Something went wrong!');
      }
      const resData = await response.json();
      await AsyncStorage.removeItem('user');
      await AsyncStorage.setItem('user', JSON.stringify(resData));

      dispatch({ type: EDIT_USER, user: resData.profile });
    } catch (err) {
      err.status = 502;
      throw err;
    }
  };
};

// export const changeUserPhoto = (token,photo) => {
//   const photoName = photo.split('/');
//   let pImage = photo.split('.');
//   pImage = photo.split('.')[pImage.length -1];
//   const photoImg = new Object();
//   if(pImage === 'jpg'){
//     photoImg.type = `image/${pImage}`;
//   }
//   else if(pImage === 'jpeg') {
//     photoImg.type = `image/${pImage}`;
//   }
//   else if(pImage === 'png') {
//     photoImg.type = `image/${pImage}`;
//   } else {
//     photoImg.type = `video/${pImage}`;
//   }

//   photoImg.uri = photo;
//   photoImg.name = photo.split('/')[photoName.length -1];
//   const formData = new FormData();
//   formData.append('imgURL', photoImg);
//   return async dispatch => {
//     // any async code you want!
//     try {
//       const response = await fetch(
//         `${URL.dbUrl}m/updateuserphoto`,
//         {
//           method: 'POST',
//           body: formData,
//           headers: {
//             Authorization: 'Bearer ' + token
//           }
//         }
//       );
//       if (response.status !== 200) {
//         throw new Error('Something went wrong!');
//       }
//       const resData = await response.json();
//       await AsyncStorage.setItem('user', JSON.stringify(resData));

//       dispatch({ type: EDIT_USER, user: resData.profile });
//     } catch (err) {
//       err.status = 502;
//       throw err;
//     }
//   };
// };

export const searchUser = (token, page, data) => {
  return async dispatch => {
    const response = await fetch(
      `${URL.dbUrl}m/finduser?page=${page}&&find=${data}`, {
          method: 'GET',
          headers: {
              Authorization: 'Bearer ' + token
          }
      }
    )

    if(response.status !== 200) {
      console.log(response.status);
      throw new Error('Something Went Wrong');
    }

    const returnRes = await response.json();

    dispatch(setSearchResult(returnRes, data))

  }
}

export const setSearchResult = (returnRes, data) => {
  return {
    type: SEARCH_USER, 
    foundUser: returnRes.users, 
    totalFound: returnRes.totalItems,
    reqData: data
  };
};


export const emptySearchData = data => {
  return {
    type: EMPTY_SEARCH, 
    foundUser: [], 
    totalFound: 0
  };
};

export const searchFollower = (token, page, data) => {
  return async dispatch => {
    const response = await fetch(
      `${URL.dbUrl}m/getfollower?page=${page}&&find=${data}`, {
          method: 'GET',
          headers: {
              Authorization: 'Bearer ' + token
          }
      }
    )

    if(response.status !== 200) {
      console.log(response.status);
      throw new Error('Something Went Wrong');
    }

    const returnRes = await response.json();

    dispatch(searchFollowerResult(returnRes, data))

  }
}

export const searchFollowerResult = (returnRes, data) => {
  return {
    type: FOLLOWER_SEARCH, 
    foundUser: returnRes.users, 
    totalFound: returnRes.totalItems,
    reqData: data
  };
};


export const searchFollowing = (token, page, data) => {
  return async dispatch => {
    const response = await fetch(
      `${URL.dbUrl}m/getfollowing?page=${page}&&find=${data}`, {
          method: 'GET',
          headers: {
              Authorization: 'Bearer ' + token
          }
      }
    )
    if(response.status !== 200) {
      console.log(response.status);
      throw new Error('Something Went Wrong');
    }

    const returnRes = await response.json();
    dispatch(searchFollowingResult(returnRes,data))
  }
}

export const searchFollowingResult = (returnRes, data) => {
  return {
    type: FOLLOWING_SEARCH, 
    foundUser: returnRes.users, 
    totalFound: returnRes.totalItems,
    reqData: data
  };
};

export const prefillConnections = (token, page) => {
  let rToken = token; let newConnect=[]; let connections=[]; let connected=[]; let cmutual=[]; let mutual=[];
  return async dispatch => {
    try {
      if(!rToken) {
        const value = await AsyncStorage.getItem('user');
        if (!value) {
          throw new Error('Something went wrong!');
        }
        rToken = await JSON.parse(value);
        rToken = rToken.stoken
      }
      const response = await fetch(
        `${URL.dbUrl}m/prefillconnect?page=${page}`, {
            method: 'POST',
            headers: {
                Authorization: 'Bearer ' + rToken
            }
        }
      );
      if (response.status !== 200) {
        throw new Error('Something went wrong!');
      }
      const resData = await response.json();
      if(resData && resData.connection && resData.connection.length >0){
        newConnect = resData.connection.filter(el => (el.mutual===false && el.accepted===false));
      }
      connections = resData.connection.filter(el => (el.mutual===true || el.accepted===true));
      mutual = resData.connected.filter(el => (el.mutual===true && el.accepted===true));
      // console.log(connections);
      connections = [...connections,...mutual];
      connected = resData.connected.filter(el => (el.mutual===true || el.accepted===true));
      cmutual = resData.connection.filter(el => (el.mutual===true && el.accepted===true));
      // console.log(cmutual)
      
      connected = [...connected,...cmutual];
      dispatch({ type: ALL_CONNECTIONS, 
        connections: connections, 
        totalConnections:(resData.totalConnections + mutual.length), 
        connected: connected,
        totalConnected:(resData.totalConnected + cmutual.length),
        newConnect: newConnect,
        page: page 
      });
    } catch (err) {
      err.status = 502;
      throw err;
    }
  };
};

export const prefillFriendsConnections = (token, page, user) => {
  let rToken = token
  const formData = new FormData();
  formData.append('user', user);
  return async dispatch => {
    try {
      if(!rToken) {
        const value = await AsyncStorage.getItem('user');
        if (!value) {
          throw new Error('Something went wrong!');
        }
        rToken = await JSON.parse(value);
        rToken = rToken.stoken
      }
      const response = await fetch(
        `${URL.dbUrl}m/friendprefillconnect?page=${page}`, {
            method: 'POST',
            body: formData,
            headers: {
                Authorization: 'Bearer ' + rToken
            }
        }
      );
      if (response.status !== 200) {
        throw new Error('Something went wrong!');
      }
      const resData = await response.json();
      dispatch({ type: FRIEND_PREFILL, 
        totalConnections:resData.totalConnections, 
        totalConnected:resData.totalConnected,
        friendPost: resData.posts,
        friendsTotalPost: resData.totalpost,
        user: user 
      });
    } catch (err) {
      err.status = 502;
      throw err;
    }
  };
};

export const emptyFriendsPrefill = () => {
  return {
    type: EMPTY_FRIEND_PREFILL, 
    usser: [], 
    totalFound: 0
  };
};


export const fetchUser = () => {
  return async dispatch => {
    // any async code you want!
    try {
      const value = await AsyncStorage.getItem('user');
      if (!value) {
        throw new Error('Something went wrong!');
      }
      const user = await JSON.parse(value);
      dispatch({ type: GET_CURRENT_USER, user: user.profile, userCountry: user.userCountry, userToken: user.stoken});
    } catch (err) {
        console.log(err);
      throw err;
    }
  };
};

export const createConnection = (user) => {
  return async dispatch => {
    // any async code you want!
      try {
          const formData = new FormData();
          formData.append('xcon', user);
          await URL.dbSubmitUrl(`m/createconnect`, formData);
          return;
      } catch (err) {
          throw err;
      }
  };
};

export const openChat = (x) => {
  return async dispatch => {
    // any async code you want!
      try {
          const formData = new FormData();
          formData.append('pager', x);
          const resData = await URL.dbSubmitUrl('m/openchat', formData);
          // console.log(resData.chat);
          if(!resData){
            dispatch({ type: CHAT_MESSAGES, data:[] });
          }
          dispatch({ type: CHAT_MESSAGES, data:resData.chat });
      }catch (err) {
          throw err;
      }
  };
};

export const updateConnection = (v,w,x,y,z,options) => {
  return async dispatch => {
    // any async code you want!
      try {
          const formData = new FormData();
          formData.append('user', v);
          formData.append('xcon', w);
          formData.append('yg', options)
          formData.append('accept', x);
          formData.append('connect', y);
          formData.append('block', z);
          await URL.dbSubmitUrl(`m/updateconnect`, formData);
      } catch (err) {
          throw err;
      }
  };
};

export const emptyConn = (x) => {
  console.log('xxxx')
  console.log(x)
  return async dispatch => {
    dispatch({
      type: EMPTY_CONN, data:x
    })
  }
}

export const setCurrentChat = (x) => {
  return async dispatch => {
    dispatch({
      type: SET_CURRENT_CHAT, data:x
    })
  }
};

export const managedProfileStates = (stateData) =>{
  return async dispatch => {
    dispatch({type: MANAGED_PROFILE_STATES, 
    connectionConnectItem : !stateData.connectionConnectItem ? null : stateData.connectionConnectItem,
    showContentConnections: !stateData.showContentConnections ? null : stateData.showContentConnections,
    searchDataG: !stateData.searchDataG ? null : stateData.searchDataG,
    searchDataF: !stateData.searchDataF ? null : stateData.searchDataF,
    routeKey: !stateData.routeKey ? null : stateData.routeKey})
  }
};


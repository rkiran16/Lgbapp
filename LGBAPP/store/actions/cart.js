import * as URL from '../../actionable/Onboard';
export const EXISTING_MESSAGES = 'EXISTING_MESSAGES';
export const REMOVE_CURRENT_CHAT = 'REMOVE_CURRENT_CHAT';
export const REMOVE_SETISTYPING = 'REMOVE_SETISTYPING';
export const CURRENT_CHAT_STATUS = 'CURRENT_CHAT_STATUS';
export const REMOVE_NEWMESSAGE = 'REMOVE_NEWMESSAGE';

// export const addToCart = product => {
//   return { type: ADD_TO_CART, product: product };
// };

// export const removeFromCart = productId => {
//   return { type: REMOVE_FROM_CART, pid: productId };
// };

export const removeCurrentChat = () => {
  return { type: REMOVE_CURRENT_CHAT };
};
export const setIsTyping = () => {
  return { type: REMOVE_SETISTYPING };
}

export const removeNewMessage = () => {
  return { type: REMOVE_NEWMESSAGE };
}



export const checkExistingMssg = (x,y) => {
  return async dispatch => {
    // any async code you want!
      try {
          const formData = new FormData();
          formData.append('xcon', x);
          formData.append('xconn', y);
          const resData = await URL.dbSubmitUrl('m/checkexistingmssg', formData);
          // console.log(resData.chat[0].text)
          if(!resData){
              dispatch({ type: EXISTING_MESSAGES, data:[] });
          }
          const text = !resData.chat[0] ? [] : resData.chat[0].text
          dispatch({ type: EXISTING_MESSAGES, data:text, owned:x, status:resData.status });
      }catch (err) {
          throw err;
      }
  };
};

export const isTyping = (x) => {
  return async dispatch => {
    // any async code you want!
    try {
      const formData = new FormData();
      formData.append('xcon', x);
      const resData = await URL.dbSubmitUrl('m/istyping', formData);
      dispatch({ type: CURRENT_CHAT_STATUS, status:resData.status });
    }catch (err) {
      throw err;
    }
  };
};

export const sendMessage = (x,y,z) => {
  return async dispatch => {
    // any async code you want!
    try {
      const formData = new FormData();
      formData.append('xcon', x);
      formData.append('text', JSON.stringify(y));
      formData.append('user', z)
      const resData = await URL.dbSubmitUrl('m/insertchatmssg', formData);
      dispatch({ type: CURRENT_CHAT_STATUS, status:resData.status });
    }catch (err) {
      throw err;
    }
  };
};

export const adjustMessageStatus = (x) => {
  return async dispatch => {
    // any async code you want!
    try {
      const formData = new FormData();
      formData.append('xcon', x);
      await URL.dbSubmitUrl('m/adjustmessagestatus', formData);
      return;
    }catch (err) {
      console.log(err)
      return;
    }
  };
};




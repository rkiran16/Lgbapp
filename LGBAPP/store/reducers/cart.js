import { SET_CURRENT_CHAT, CHAT_MESSAGES } from '../actions/editProfile';
import { EXISTING_MESSAGES, REMOVE_CURRENT_CHAT, REMOVE_SETISTYPING, CURRENT_CHAT_STATUS, REMOVE_NEWMESSAGE } from '../actions/cart';
import { IS_TYPING, NEW_MESSAGE } from '../actions/dashboard';


const initialState = {
  currentChat:null,
  existingMessages:null,
  chatMessages:[],
  chatPager:0,
  isTyping:null,
  isOnline:'Offline',
  newMessage:null,
  newText:null,
  newTextConnID:null
};

export default (state = initialState, action) => {
  switch (action.type) {
    case SET_CURRENT_CHAT:
      return{
        ...state,
        currentChat: action.data
      };
    case EXISTING_MESSAGES:
        return{
            ...state,
            existingMessages: state.currentChat.connID === action.owned ? action.data:[],
            isOnline: state.currentChat.connID === action.owned ? action.status:'Offline'
        };
    case NEW_MESSAGE: 
        return{
            ...state,
            newMessage: !state.currentChat ? null : state.currentChat.connID === action.conn ? action.data: null,
            newText: !state.currentChat ? action.notify: state.currentChat.connID === action.conn ? null : action.notify,
            newTextConnID: action.conn
            // isOnline: state.currentChat.connID === action.conn && 'Online',
        }
    case REMOVE_NEWMESSAGE:
        return{
            ...state,
            newMessage: null,
            newText: null,
        }
    case REMOVE_CURRENT_CHAT: 
        return {
            ...state,
            currentChat: null
        }
    case CHAT_MESSAGES:
        let chatty = state.chatMessages;
        // let chatty = action.data;
        if(state.chatMessages.length > 0){
            chatty = action.data.filter(x => !state.chatMessages.some(y => (y._id === x._id)))
            // chatty = state.chatMessages.filter(x => !action.data.some(y => (y._id === x._id)))
            // chatty = state.chatMessages.filter(x => action.data.find(y => x._id !== y._id));
        }
        return{
            ...state,
            chatMessages:action.data.length > 0 ? action.data.concat(chatty): state.chatMessages,
            chatPager: action.data.length > 0 && state.chatPager+1
        }
    case IS_TYPING:
        return{
            ...state,
            isTyping:action.data
        }
    case REMOVE_SETISTYPING:
        return{
            ...state,
            isTyping:null
        }
    case CURRENT_CHAT_STATUS:
        return{
            ...state,
            isOnline:action.status
        }
  }
  return state;
};


// export default (state = initialState, action) => {
//     switch (action.type) {
//       case ADD_TO_CART:
//         const addedProduct = action.product;
//         const prodPrice = addedProduct.price;
//         const prodTitle = addedProduct.title;
  
//         let updatedOrNewCartItem;
  
//         if (state.items[addedProduct.id]) {
//           // already have the item in the cart
//           updatedOrNewCartItem = new CartItem(
//             state.items[addedProduct.id].quantity + 1,
//             prodPrice,
//             prodTitle,
//             state.items[addedProduct.id].sum + prodPrice
//           );
//         } else {
//           updatedOrNewCartItem = new CartItem(1, prodPrice, prodTitle, prodPrice);
//         }
//         return {
//           ...state,
//           items: { ...state.items, [addedProduct.id]: updatedOrNewCartItem },
//           totalAmount: state.totalAmount + prodPrice
//         };
//       case REMOVE_FROM_CART:
//         const selectedCartItem = state.items[action.pid];
//         const currentQty = selectedCartItem.quantity;
//         let updatedCartItems;
//         if (currentQty > 1) {
//           // need to reduce it, not erase it
//           const updatedCartItem = new CartItem(
//             selectedCartItem.quantity - 1,
//             selectedCartItem.productPrice,
//             selectedCartItem.productTitle,
//             selectedCartItem.sum - selectedCartItem.productPrice
//           );
//           updatedCartItems = { ...state.items, [action.pid]: updatedCartItem };
//         } else {
//           updatedCartItems = { ...state.items };
//           delete updatedCartItems[action.pid];
//         }
//         return {
//           ...state,
//           items: updatedCartItems,
//           totalAmount: state.totalAmount - selectedCartItem.productPrice
//         };
//       case ADD_ORDER:
//         return initialState;
//       case DELETE_PRODUCT:
//         if (!state.items[action.pid]) {
//           return state;
//         }
//         const updatedItems = { ...state.items };
//         const itemTotal = state.items[action.pid].sum;
//         delete updatedItems[action.pid];
//         return {
//           ...state,
//           items: updatedItems,
//           totalAmount: state.totalAmount - itemTotal
//         };
//     }
  
//     return state;
//   };
  

import { MISC_INCREASE,
  SET_VIEW_ITEM, 
  REMOVE_FROM_CART,
  ADD_CART_ITEM,
  FETCH_ORDERS,
  EMPTY_CART,
  FETCHED_REVIEW,
  SUBMITS_REVIEW,
  FETCHED_REWARD,
} from '../actions/orders';

const initialState = {
  viewProduct: null,
  orders: [],
  ordersPage: 1,
  orderTotal: 0,
  carts: [],
  rewards: [],
  totalAvailableRewards:0,
  reviewedPost:[],
  currentReviewID:null,
  totalReviews:null,
  submittedReview:null,
};

export default (state = initialState, action) => {
  switch (action.type) {
    case REMOVE_FROM_CART:
      return {
        ...state,
        carts: state.carts.filter(
          items => items._id !== action.data._id
        )
      };
    case SET_VIEW_ITEM:
      return {
        ...state,
        viewProduct: action.data
      };
    case FETCH_ORDERS:
      let currOrder = state.orders;
      currOrder = currOrder.length > 0 ? action.data.filter(x => !currOrder.some(y => (y._id === x._id))) : action.data;
      return {
        ...state,
        orders: state.orders.concat(currOrder),
        ordersPage: state.ordersPage+action.pager,
        orderTotal: action.total
      };
    case ADD_CART_ITEM:
      let prev = state.carts;
      prev = prev.filter(items => items._id !== action.data._id)
      return {
        ...state,
        carts: prev.concat(action.data)
      };
    case MISC_INCREASE:
      return {
        ...state,
        carts: state.carts.map(item => item._id === action.item ? {...item, qty:item.qty+action.data} : item)
      };
    case EMPTY_CART:
      return {
        ...state,
        carts:[],
      }
    case FETCHED_REVIEW:
      let prevx = state.reviewedPost;
      let prevxx;
      if(state.currentReviewID !== action.cat){
        prevxx = action.data;
      }else{
        prevx = new Set(prevx.map(({ _id }) => _id));// const cars1IDs = new Set(cars1.map(({ id }) => id));
        prevxx = [
          ...state.reviewedPost,
          ...action.data.filter(({ _id }) => !prevx.has(_id))
        ];
      }
      return{
        ...state,
        reviewedPost:prevxx,
        currentReviewID: action.cat,
        totalReviews: action.total,
      }
    case SUBMITS_REVIEW:
      return {
        ...state,
        submittedReview:true
      }
    case FETCHED_REWARD:
      let prevy = state.rewards;
      let prevyy;
      if(action.pager === 1 || action.pager === "1"){
        prevyy = action.data;
      }else{
        prevy = new Set(prevy.map(({ _id }) => _id));// const cars1IDs = new Set(cars1.map(({ id }) => id));
        prevyy = [
          ...state.rewards,
          ...action.data.filter(({ _id }) => !prevy.has(_id))
        ];
      }
      return{
        ...state,
        rewards: prevyy,
        totalAvailableRewards: action.total === 0 ? state.totalAvailableRewards : action.total,
      }
  }
  return state;
};

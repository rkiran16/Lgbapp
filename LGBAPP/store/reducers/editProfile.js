import {
  EDIT_USER,
  GET_COUNTRY,
  CHECK_USERNAME,
  GET_CURRENT_USER,
  SEARCH_USER,
  FOLLOWER_SEARCH,
  FOLLOWING_SEARCH,
  ALL_CONNECTIONS, EMPTY_SEARCH,
  MANAGED_PROFILE_STATES,
  FRIEND_PREFILL, EMPTY_CONN,
  EMPTY_FRIEND_PREFILL,
} from '../actions/editProfile';


const initialState = {
    country: [], profile: {},
    category: [], commonCategory:[],
    displayName: null, userCountry: null,
    userToken: null, 
    followerSearch: [],
    totalFollowerSearch: 0, followingSearch: [],
    totalFollowingSearch: 0, allConnections: [],
    totalConnections: 0, allConnected: [],
    totalConnected: 0, connectionsPager: 0,
    searchFollowerPager: 0, searchFollowingPager: 0, newConnect:[],
    searchPager: 0, searchedUsers: [], totalUserFound: 0, searchData:null,
    managedProfileState: {
        connectionConnectItem: null,
        showContentConnections: null,
        searchDataG: null,
        searchDataF: null,
        routeKey: null
    },
    friendsPrefill: {
        totalConnections: 0,
        totalConnected: 0,
        friendPost: [],
        friendsTotalPost: 0,
        prefillPager: 0,
        friendsID: null
    }
};
let rmSearchAll, rmFollowerSearch, rmFollowing, rmFriends; 
let xcnn = [];
let xcntd = []; let nnCnt = [];

export default (state = initialState, action) => {
    switch (action.type) {
      case GET_COUNTRY:
        return {
          ...state,
          country: action.country,
          category: action.category,
          commonCategory: action.commonCategory
        };
    case CHECK_USERNAME:
        return {
            ...state,
            displayName: action.displayName
        };
    case EDIT_USER:
        return {
            ...state,
            profile: action.user
        };
    case GET_CURRENT_USER:
        return {
            ...state,
            profile: action.user,
            userCountry: action.userCountry,
            userToken: action.userToken
        };
    case EMPTY_SEARCH:
        return {
            ...state,
            searchData: null,
            searchedUsers: [],
            totalUserFound: 0,
            searchPager: 0,
            followingSearch: [],
            totalFollowingSearch: 0,
            searchFollowingPager: 0,
            followerSearch: [],
            totalFollowerSearch: 0,
            searchFollowerPager: 0
        };
    case EMPTY_FRIEND_PREFILL:
        return {
            ...state,
            friendsPrefill: {
                ...state.friendsPrefill,
                totalConnections: action.totalFound,
                totalConnected: action.totalFound,
                friendPost: action.usser,
                friendsTotalPost: action.totalFound,
                prefillPager: action.totalFound,
                friendsID: null,
            },
            managedProfileState: {
                ...state.managedProfileState,
                connectionConnectItem: null,
                showContentConnections: null,
                searchDataG: null,
                searchDataF: null,
                routeKey: null,
            }
        };
    case EMPTY_CONN:
        return {
            ...state,
            newConnect: state.newConnect.filter(
                items => items._id !== action.data
              )
        };
    case SEARCH_USER:
        rmSearchAll = state.searchedUsers.filter(x => action.foundUser.find(y => x._id !== y._id))
        return {
            ...state,
            searchedUsers: rmSearchAll.concat(action.foundUser),
            totalUserFound: action.totalFound,
            searchPager: action.foundUser.length > 0 ? state.searchPager + 1 : state.searchPager
        };
    case FOLLOWER_SEARCH:
        rmFollowerSearch = state.followerSearch.filter(x => action.foundUser.find(y => x._id !== y._id))
        return {
            ...state,
            followerSearch: rmFollowerSearch.concat(action.foundUser),
            totalFollowerSearch: action.totalFound,
            searchFollowerPager: action.foundUser.length > 0 ? state.searchFollowerPager + 1 : state.searchFollowerPager
        };
    case FOLLOWING_SEARCH:
        rmFollowing = state.followingSearch.filter(x => action.foundUser.find(y => x._id !== y._id))
        return {
            ...state,
            followingSearch: rmFollowing.concat(action.foundUser),
            totalFollowingSearch: action.totalFound,
            searchFollowingPager: action.foundUser.length > 0 ? state.searchFollowingPager + 1 : state.searchFollowingPager
        };
    case ALL_CONNECTIONS:
        let prevb = state.newConnect; let prevbb = state.newConnect;
        let prevc = state.allConnected; let prevcc = state.allConnected;
        let prevd = state.allConnections; let prevdd = state.allConnections;
        nnCnt = state.newConnect; xcnn = state.allConnections; xcntd = state.allConnected
        if(action.connections && action.connections.length > 0) {
            // xcnn = state.allConnections.filter(x => action.connections.find(y => x._id !== y._id));
            prevd = new Set(prevd.map(({ _id }) => _id));
            prevdd = [
            ...state.allConnections,
            ...action.connections.filter(({ _id }) => !prevd.has(_id))
            ];
        }
        if(action.connected && action.connected.length > 0) {
            // xcntd = state.allConnected.filter(x => action.connected.find(y => x._id !== y._id));
            prevc = new Set(prevc.map(({ _id }) => _id));
            prevcc = [
            ...state.allConnected,
            ...action.connected.filter(({ _id }) => !prevc.has(_id))
            ];
        }
        if(action.newConnect && action.newConnect.length > 0) {
            prevb = new Set(prevb.map(({ _id }) => _id));
            prevbb = [
            ...state.newConnect,
            ...action.newConnect.filter(({ _id }) => !prevb.has(_id))
            ];
            // nnCnt = state.newConnect.filter(x => action.newConnect.find(y => x._id !== y._id));
        }
        return {
            ...state,
            allConnections: prevdd,
            totalConnections: action.totalConnections,
            allConnected: prevcc, //action.connected.concat(xcntd),
            newConnect: prevbb, //action.newConnect.concat(nnCnt),
            totalConnected: action.totalConnected,
            connectionsPager: action.connections.length > 0 || action.connected.length > 0 ? action.page + 1 : state.connectionsPager
        };
    case MANAGED_PROFILE_STATES:
        return {
            ...state,
            managedProfileState: {
                ...state.managedProfileState,
                connectionConnectItem: action.connectionConnectItem,
                showContentConnections : action.showContentConnections,
                searchDataG : action.searchDataG,
                searchDataF : action.searchDataF,
                routeKey : action.routeKey
            }
        };
    case FRIEND_PREFILL:
        let preva = state.friendsPrefill.friendPost;
        let prevaa;
        if(state.friendsPrefill.friendsID !== action.user){
            prevaa = action.friendPost;
        }else{
            preva = new Set(preva.map(({ _id }) => _id));
            prevaa = [
            ...state.friendsPrefill.friendPost,
            ...action.friendPost.filter(({ _id }) => !preva.has(_id))
            ];
        }
        return{
            ...state,
            friendsPrefill: {
                ...state.friendsPrefill,
                totalConnections: action.totalConnections === 'N/A' ? 
                    state.friendsPrefill.totalConnections : action.totalConnections,
                totalConnected: action.totalConnected === 'N/A' ? 
                    state.friendsPrefill.totalConnected : action.totalConnected,
                friendPost: prevaa,
                friendsTotalPost: action.friendsTotalPost === 'N/A' ? 
                    state.friendsPrefill.totalConnected : action.friendsTotalPost,
                prefillPager: action.friendPost.length > 0 ? state.friendsPrefill.prefillPager + 1:state.friendsPrefill.prefillPager
            }
        };
    }
    return state;
};
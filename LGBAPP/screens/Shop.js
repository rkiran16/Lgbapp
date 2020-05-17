import React from 'react';
import { StyleSheet, Dimensions, ScrollView, View, Image, Platform, TouchableWithoutFeedback } from 'react-native';
import { Button, Block, theme, Text } from 'galio-framework';
import { SearchBar , Slider, Rating} from 'react-native-elements';
import * as dash from '../store/actions/dashboard';
import { connect } from 'react-redux';
import { Card, Icon, Spinner, Video as Videos } from '../components';
import { Images, argonTheme } from "../constants";
import articles from '../constants/articles';
import { HeaderHeight } from "../constants/utils";



const { height, width } = Dimensions.get('screen');
const androidPhone = () => Platform.OS === 'android';
const thumbMeasure = (width - 48 - 32) / 3;
const cardWidth = width - theme.SIZES.BASE * 2;
const promotional = [
    {
      title: "Music Album",
      description:
        "Rock music is a genre of popular music. It developed during and after the 1960s in the United Kingdom.",
      image:
        "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?fit=crop&w=840&q=80",
      price: "$125"
    },
    {
      title: "Events",
      description:
        "Rock music is a genre of popular music. It developed during and after the 1960s in the United Kingdom.",
      image:
        "https://images.unsplash.com/photo-1543747579-795b9c2c3ada?fit=crop&w=840&q=80",
      price: "$35"
    }
];

class Shop extends React.Component {

  state = {
    filter: false,
    searchText: null,
    errWait: 0,
    play: false,
    page: 1,
    loading: false,
    inloading: false,
    error: false,
    errs: null,
    tabs: [],
    priceFilter: false,
    ratingsFilter: false,
    filtered_price: 0,
    filtered_priceOrder: null,
    filtered_ratings: 0,
  };

  componentWillMount() {
    this.props.navigation.setParams({ 
        navHeaderFunction: this.navLeftHeaderFunction,
        navLeftHeaderFunction: this.navHeaderFunction,
    });
  }

  componentDidMount() {

  }

  searchItem = (data) => {
    console.log(data)
  }

//   async componentDidMount() {
//     this.setState({loading:true});
//     await this.fetchMyData();
//   }


  navHeaderFunction = ()=> {
    return this.props.navigation.navigate('Orders');
  }

  navLeftHeaderFunction = () => {
    this.setState({filter: !this.state.filter, priceFilter: false, ratingsFilter: false});
  }

  searchFunctions = (data) => {
    if(!data) {
      return;
    }
    if(data) {
      return;
    }
  }

  renderNavigation = () => {
    return (
      <Block flex style={{...styles.group, height:110, position:'absolute', marginTop:10, elevation:5,
      Top:HeaderHeight, zIndex: 10, borderBottomWidth: StyleSheet.hairlineWidth}}>
        <Block style={{ marginBottom: theme.SIZES.BASE }}>
          <SearchBar
              onChangeText={value => this.searchFunctions(value.replace(/[^a-z,A-Z,0-9]/g,''))}
              onClear={() => this.setState({searchText:null})}
              onCancel= {() => this.setState({searchText:null})}
              showLoading={!this.state.searchText ? false : true}
              color={argonTheme.COLORS.GRADIENT_START}
              value={this.state.searchText}
              lightTheme={true}
              placeholder= {this.state.filterChangeIndex}
              inputContainerStyle={styles.search}
              showCancel={true}
              cancelButtonTitle='Delete'
            />
            <Block row style={{...styles.options, marginTop:0, elevation:1, borderColor:argonTheme.COLORS.GRADIENT_START,
                backgroundColor:'white', paddingVertical:12, alignItems:'center', justifyContent:'center', borderBottomWidth: StyleSheet.hairlineWidth,}}>
                <Button shadowless style={[styles.tab]} onPress={() => this.setState({priceFilter: !this.state.priceFilter, ratingsFilter:false})}>
                    <Block row middle>
                    <Icon name="attach-money" family="MaterialIcons" style={{ paddingRight: 8 }} color={this.state.filtered_price > 0 ? argonTheme.COLORS.GRADIENT_START: argonTheme.COLORS.MUTED} />
                    <Text size={16} style={{...styles.tabTitle, fontFamily:'regular', 
                        color:this.state.filtered_price > 0 ? argonTheme.COLORS.GRADIENT_START: argonTheme.COLORS.MUTED}}>
                            {this.state.filtered_price > 0 ? `Price <= $ ${this.state.filtered_price}` : 'Price'}
                    </Text>
                    </Block>
                </Button>
                <Button shadowless style={[styles.tab]} onPress={() => this.setState({ratingsFilter: !this.state.ratingsFilter, priceFilter:false})}>
                    <Block row middle>
                    <Icon name="staro" family="AntDesign" style={{ paddingRight: 8 }} color={this.state.filtered_ratings > 0 ? argonTheme.COLORS.GRADIENT_START: argonTheme.COLORS.MUTED} />
                    <Text size={16} style={{...styles.tabTitle, fontFamily:'regular', 
                    color:this.state.filtered_ratings > 0 ? argonTheme.COLORS.GRADIENT_START: argonTheme.COLORS.MUTED}}>
                        {this.state.filtered_ratings > 0 ? `Ratings (${this.state.filtered_ratings})` : 'Ratings'}
                    </Text>
                    </Block>
                </Button>
            </Block>
        </Block>
      </Block>
    );
  };

  fetchMyData = async() => {
    this.setState({inloading:true, error: false});
    if(this.state.errWait > 0 ){
      setTimeout(() => {
        console.log('go')
      }, this.state.errWait)
    }
    try {
      await this.props.fetchData(this.state.page);
      this.setState({inloading:false, loading: false, page: this.state.page+1, errWait: 0});
      return;
    }catch(err) {
      if(err.status === 429) {
        return this.setState({errWait: 4500,inloading: false, loading: false, error: true, errs: err.message});
      }
      this.setState({inloading: false, loading: false, error: true, errs: err.message});
    }
  }

    renderPromo = (item, index) => {
      const { navigation } = this.props;
  
      return (
        <TouchableWithoutFeedback style={{ zIndex: 3 }} key={`product-${item.title}`}
          onPress={() => navigation.navigate("Pro", { product: item })}>
          <Block center style={styles.productItem}>
            <Image resizeMode="cover" style={styles.productImage}
              source={{ uri: item.image }} />
            <Block center style={{ paddingHorizontal: theme.SIZES.BASE }}>
              <Text center size={16} color={theme.COLORS.MUTED}
                style={{...styles.productPrice, fontFamily:'regular'}}>
                {item.price}
              </Text>
              <Text center style={{fontFamily:'regular', fontSize: 34}}>
                {item.title}
              </Text>
              <Text center size={16} color={theme.COLORS.MUTED}
                style={{...styles.productDescription, fontFamily:'regular'}}>
                {item.description}
              </Text>
            </Block>
          </Block>
        </TouchableWithoutFeedback>
      );
    };

  renderArticles = () => {
    const listLength = articles.length;
    if(this.state.loading === true) {
      return (
        <Block flex={1} style={{alignItems:'center', justifyContent:'center', height}}>
          <Spinner label="Fetching your faves..." />
        </Block>
      )
    }
    if(this.state.error === true) {
      return (
        <Block flex={1} style={{alignItems:'center', justifyContent:'center', height, width}}>
          <Text size={20} style={{...styles.textFont, marginBottom:5}}>{this.state.errs}</Text>
          <Button shadowless onPress={this.fetchMyData} style={styles.errBtn}>
            <Block row space="between">
                <Text style={styles.textFont} size={14} color={ Platform .OS==='android' ? 'white' : argonTheme.COLORS.GRADIENT_START}> Try Again!</Text>
            </Block>
          </Button>
        </Block>
      )
    }

    if(!this.state.error || !this.state.loading){
      return (
        <View style={[styles.home, justifyContent='space-around', flexDirection='column']}>
          <ScrollView centerContent
            onScroll={this.handleScroll}
            scrollEventThrottle = {18}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.articles}>
                <Block>
                    <Text style={{fontFamily:'bold', fontSize: 18, color:argonTheme.COLORS.GRADIENT_END}}>
                        {`Product Items (${articles.length})`}
                    </Text>
                </Block>
                <Block row space="between" style={{ flexWrap: "wrap" }}>
                    {/* {
                        articles.map((el, index) => {
                            if(index <= 3) {
                            return <Block key={el.title} style={{width:width*0.47}}>
                                <Card item={el} shop/>
                            </Block>
                            }
                        })
                    } */}
                </Block>

                <Block flex style={{ marginTop: theme.SIZES.BASE / 2 }}>
                    <ScrollView
                    horizontal={true}
                    pagingEnabled={true}
                    decelerationRate={0}
                    scrollEventThrottle={16}
                    snapToAlignment="center"
                    showsHorizontalScrollIndicator={false}
                    snapToInterval={cardWidth + theme.SIZES.BASE * 0.375}
                    contentContainerStyle={{
                        paddingHorizontal: theme.SIZES.BASE / 2
                    }}
                    >
                    {promotional &&
                        promotional.map((item, index) =>
                        this.renderPromo(item, index)
                        )}
                    </ScrollView>
                </Block>
                <Block row space="between" style={{ flexWrap: "wrap" }}>
                    {
                        // articles.map((el, index) => {
                        //     if(index <= 4) {
                        //     return <Block key={el.title} style={{width:width*0.47}}>
                        //         <Card item={el} shop/>
                        //     </Block>
                        //     }
                        // })
                    }
                </Block>
                {
                    this.state.inloading ?
                    <Block style={{alignItems:'center', justifyContent:'center', height: theme.SIZES.BASE*4}}>
                    <Spinner label="Fetching, coming right up..." />
                    </Block>
                    :
                    null
                }
          </ScrollView>
        </View>
      )
    }
    return;
  };


  render() {
    return (
      <Block flex center style={styles.home}>
        {this.state.filter ? this.renderNavigation(): null}
        {this.renderArticles()}
        {
          this.state.priceFilter || this.state.ratingsFilter ?
          <Block shadow={true} shadowColor='black' center style={{...styles.float,justifyContent: 'flex-end'}}>
            <Block style={{...styles.floatInside, paddingHorizontal: 0, marginBottom: Platform.OS==='android' ? 20 : 18}}>
              <Block style={{flex:1}}>
                {
                    this.state.priceFilter ?
                    <Block flex={1} style={{paddingHorizontal:theme.SIZES.BASE}}>
                        <Block flex={0.35}>
                            <Text style={{fontFamily:'regular', fontSize: 20, color: argonTheme.COLORS.GRADIENT_END}}>Filter Listing By Price</Text>
                        </Block>
                        <Block flex={0.65}>
                        <Slider
                            value={this.state.filtered_price}
                            onValueChange={value => this.setState({ filtered_price: Math.round(value) })}
                            thumbTintColor={argonTheme.COLORS.GRADIENT_START}
                            minimumTrackTintColor={argonTheme.COLORS.GRADIENT_START}
                            maximumTrackTintColor={argonTheme.COLORS.GRADIENT_END}
                            minimumValue={0}
                            maximumValue={1000}
                        />
                        <Text style={{fontFamily:'bold', fontSize: 15, color: argonTheme.COLORS.GRADIENT_END}}>Value: {this.state.filtered_price}</Text>
                        </Block>
                    </Block>: null
                }

                {
                    this.state.ratingsFilter ?
                    <Block flex={1} style={{paddingHorizontal:theme.SIZES.BASE}}>
                        <Block flex={0.35}>
                            <Text style={{fontFamily:'regular', fontSize: 16, color: argonTheme.COLORS.GRADIENT_END}}>Filter Listing By Ratings</Text>
                        </Block>
                        <Block flex={0.65}>
                        <Rating
                            // reviews={['Terrible', 'Bad', 'Okay', 'Good', 'Great']}
                            ratingTextColor={argonTheme.COLORS.GRADIENT_START}
                            type='star'
                            ratingColor='#6B24AA'
                            ratingCount={5}
                            showRating
                            imageSize = {30}
                            minValue= {0}
                            startingValue={0}
                            onFinishRating={value => {this.setState({filtered_ratings: value})}}
                            />
                        </Block>
                    </Block>: null
                }
              </Block>
            </Block>
          </Block>
          :
          null
        }
      </Block>
    );
  }
}

const styles = StyleSheet.create({
  home: {
    width: width,    
  },
  float: {
    flex: 1, 
    elevation: 5,
    position:'absolute',
    height:height,
    zIndex:5,
    backgroundColor: 'rgba(0,0,0,0.4)',
    width: width,
    bottom: 2
  },
  floatInside: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius:4, 
    width:width-theme.SIZES.BASE, 
    height: 150, zIndex:5, 
    marginBottom: 15, 
    backgroundColor:'#FFF', 
    elevation: 5,
    zIndex:5,
    opacity: 1,
    borderColor: argonTheme.COLORS.GRADIENT_START,
    borderWidth: StyleSheet.hairlineWidth,
  },
  options: {
    marginBottom: 10,
    marginTop: 10,
    elevation: 4,
  },
  tab: {
    backgroundColor: theme.COLORS.TRANSPARENT,
    width: width * 0.35,
    borderRadius: 0,
    borderWidth: 0,
    height: 24,
    elevation: 0,
  },
  group: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: argonTheme.COLORS.GREY,
    marginBottom: theme.SIZES.BASE/4,
    marginTop: theme.SIZES.BASE,
    width: width
  },
  articles: {
    width: width,
    paddingVertical: theme.SIZES.BASE,
    paddingHorizontal: 5
  },
  albumThumb: {
    borderRadius: 4,
    marginVertical: 4,
    alignSelf: "center",
    width: thumbMeasure,
    height: thumbMeasure
  },
  button: {
    padding: 8,
    position: 'relative',
  },
  avatarContainer: { //delete
    position: "relative",
    marginTop: androidPhone ? 40 : 38
  },
  avatar: { //delete
    width: androidPhone ? 48 : 50,
    height: androidPhone ? 48 : 50,
    borderRadius: androidPhone ? 24 : 25,
    borderWidth: 0
  },
  divider: {
    borderRightWidth: 0.3,
    borderRightColor: theme.COLORS.ICON,
  },
  shadow: {
    shadowColor: theme.COLORS.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    shadowOpacity: 0.15,
    elevation: 5,
  },
  title: {
    paddingBottom: theme.SIZES.BASE - 5,
    paddingHorizontal: theme.SIZES.BASE * 0.2,
    marginTop: 1,
    color: argonTheme.COLORS.HEADER
  },
  textFont: {
    fontFamily: 'regular'
  },
  errBtn:{
    width: theme.SIZES.BASE * 8,
    backgroundColor: Platform .OS==='android' ? argonTheme.COLORS.GRADIENT_START : 'transparent'
  },
  productItem: {
    width: width - theme.SIZES.BASE*2.2,
    marginHorizontal: theme.SIZES.BASE,
    shadowColor: "black",
    shadowOffset: { width: 0, height: 7 },
    shadowRadius: 10,
    shadowOpacity: 0.2
  },
  productImage: {
    width: width - theme.SIZES.BASE*2.2,
    height: cardWidth - theme.SIZES.BASE,
    borderRadius: 3
  },
  productPrice: {
    paddingTop: theme.SIZES.BASE,
    paddingBottom: theme.SIZES.BASE / 2
  },
  productDescription: {
    paddingTop: theme.SIZES.BASE
    // paddingBottom: theme.SIZES.BASE * 2,
  },
  search: {
    height: 48,
    //width: width,
    borderRadius: 0,
    backgroundColor:'rgba(107,36,170,0.1)',
  },
});

const mapStateToProps = function(state) {
  return {
    catMenus: state.dashboard.catMenu,
    //loggedIn: state.auth.loggedIn
  }
}

export default connect(mapStateToProps,dash)(Shop);

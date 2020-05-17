import React from 'react';
import { StyleSheet, FlatList, Dimensions, ScrollView, View, Image, Platform, TouchableWithoutFeedback, TouchableOpacity } from 'react-native';
import { Button, Block, theme, Text } from 'galio-framework';
import * as dash from '../store/actions/dashboard';
import { connect } from 'react-redux';
import { Card, Spinner, Icon } from '../components';
import { Images, argonTheme } from "../constants";
import { ListItem } from 'react-native-elements'


const { height, width } = Dimensions.get('screen');
const thumbMeasure = (width - 48 - 32) / 3;

class CatOption extends React.Component {

  state = {
    iKat: null,
    iKommonkat: null,
    loading: false,
    showPopular: 2,
    searchDb: [],
    search: false,
    searchResult:[],
  };

  componentDidMount() {
    this.prepareSearch();
  }

  prepareSearch = () => {
    const { tags, rKat} = this.props;
    const merge = rKat.concat(tags);
    this.setState({searchDb:merge}, () => {
      this.props.navigation.setParams({ 
        navHeaderSearchLabel: 'What are you looking for?',
        searchFunction: this.searchCatOptions
      });
    });
    return;
  }


  searchCatOptions = async(data) => {
    this.setState({search:true});
    let result; 
    if(data){
      result = this.state.searchDb.filter(el => el.name.toLowerCase().includes(data));
      if(result){
        return this.setState({searchResult: result.length > 0 ? result: []});
      }
    }
    if(!data){
      this.setState({search: false});
      return
    }
    return;
  }

  findAllSelect = async(el) => {
    const item = []
    const res = this.state.searchDb.find(e => e._id === el)
    if(res) {
      item.push(res);
      await this.props.storedSearches(item);
    }
    return this.props.navigation.navigate("Categories", 
    {headName: res.name, idToFind:res._id, routeKey:this.props.navigation.state.routeName, item:null})
  }

  renderItem = ({ item }) => (
    <TouchableOpacity onPress={async() => this.findAllSelect(item._id)}>
        <ListItem
        title={`${item.name}`}
        titleStyle={{ color: argonTheme.COLORS.GRADIENT_END, fontFamily:'regular', }}
        bottomDivider
        // chevron
        leftIcon = {
          <Icon 
            name='md-funnel'
            family='Ionicon'
            size={24}
            style={{color:argonTheme.COLORS.GRADIENT_END}}
          />
        }
      />
    </TouchableOpacity>
  );

  categoryItem = ({item}) => (
    <TouchableWithoutFeedback onPress={() => this.findAllSelect(item._id)}
    style={{width:width/3, alignItems:'center', justifyContent:'center', marginBottom:5}}>
      <Block style={{...styles.shadow, height:148}}>
        <Image
          resizeMode="cover"
          source={Images[item.url]}
          style={styles.albumThumb}
        />
        <Block center style={{position:'absolute', bottom: 8, padding: 2, flexWrap: "wrap", width: '100%'}}>
          <Text size={12} color={argonTheme.COLORS.GRADIENT_END} style={styles.textFont}>
            {item.name}
          </Text>
        </Block>
      </Block>
    </TouchableWithoutFeedback>
  );

  flatlistHeader = () => (
    <Block style={{marginBottom: 10}}>
      <Text style={{fontFamily:'bold', fontSize: 20, color:argonTheme.COLORS.GRADIENT_START}}>
        {`Found (${this.state.searchResult.length})`}
      </Text>
    </Block>
  )

  renderOption1 = () => {
    const { rKommon } = this.props
    return (
      <Block
        flex
        style={{ paddingBottom: theme.SIZES.BASE, paddingTop: theme.SIZES.BASE * 0.5 }}
      >
        <Text size={16} style={styles.title}>
          Popular Category
        </Text>
        <Block style={{ marginHorizontal: theme.SIZES.BASE - 8 }}>
          <Block
            row
            space="between"
            style={{ marginTop: theme.SIZES.BASE, flexWrap: "wrap" }}
          >
            {rKommon.map((el, index) => (//Images.Viewed.map((img, index) => (
              index <= this.state.showPopular ?
              <TouchableWithoutFeedback key={`viewed-${el._id}`} onPress={() => this.findAllSelect(el._id)}>
              <Block key={`viewed-${el._id}`} style={{...styles.shadow,marginTop: index >= 2 ? 25:0}}>
                <Image
                  resizeMode="cover"
                  source={Images[el.url]}
                  style={styles.albumThumb}
                />
                  <Block center style={{position:'absolute', bottom: index >= 5 ? -14 : -8, padding: 2, flexWrap: "wrap", width: '100%', borderRadiusBottomLeft:4, borderRadiusBottomRight:4}}>
                    <Text size={12} color={argonTheme.COLORS.GRADIENT_END} style={styles.textFont}>
                      {el.name}
                    </Text>
                  </Block>
              </Block>
              </TouchableWithoutFeedback>
              : null
            ))}
          </Block>
          <TouchableOpacity onPress={() => this.setState({showPopular: this.state.showPopular === 2 ? 5:2})}>
            <Block flex right style={{marginTop: 25}}>
              <Text
                style={{fontFamily:'bold'}}
                size={18}
                color={argonTheme.COLORS.GRADIENT_END}
              >
                {this.state.showPopular === 2 ? 'View All': 'View Less'} 
              </Text>
            </Block>
          </TouchableOpacity>
        </Block>
      </Block>
    );
  };

  renderArticles = () => {
    const { rKat } = this.props
    return (
      <View style={[styles.home, justifyContent='space-around', flexDirection='column']}>
        <ScrollView centerContent
          scrollEventThrottle = {18}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.articles}>
            {this.renderOption1()}
            <Block flex>
              <Block flex row>
                  <Text size={16} style={styles.title}>
                      All Category
                  </Text>
              </Block>
              <Block flex={1}>
                <FlatList
                  style={{flex: 1}}
                  alwaysBounceVertical={true}
                  showsVerticalScrollIndicator={false}
                  columnWrapperStyle={{justifyContent:'space-between', flexDirection:'row', flexWrap: "wrap", }}
                  numColumns={3}
                  // extraData={this.props.userPost}
                  data={rKat}
                  initialNumToRender={9}
                  keyExtractor={pp => pp._id}
                  // onEndReachedThreshold={0.5}
                  // onEndReached={this.loadMorePost}
                  removeClippedSubviews
                  renderItem={this.categoryItem}
                />
              </Block>
            </Block>
        </ScrollView>
      </View>
    )
  };


  render() {
    return (
      <Block flex center style={styles.home}>
        {this.state.loading===true ? 
        <Block style={{position:'absolute', top: 0}}><Spinner color={argonTheme.COLORS.GRADIENT_START}/></Block> : null
        }
        {
          this.state.search ?
          <Block flex={1} style={{marginTop: 8, width:width, paddingHorizontal:5}}>
            <FlatList
              extraData={this.state}
              style={{flex:1}}
              ListHeaderComponent = {this.flatlistHeader}
              alwaysBounceHorizontal={true}
              showsVerticalScrollIndicator={false}
              horizontal={false}
              data={this.state.searchResult}
              keyExtractor={pp => pp._id}
              renderItem={this.renderItem}
            /> 
          </Block> : this.renderArticles()
        }
      </Block>
    );
  }
}

const styles = StyleSheet.create({
  home: {
    width: width,    
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
  shadow: {
    shadowColor: theme.COLORS.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    shadowOpacity: 0.15,
    elevation: 5,
  },
  title: {
    paddingHorizontal: theme.SIZES.BASE * 0.2,
    marginTop: 1,
    color: argonTheme.COLORS.GRADIENT_START,
    fontFamily: 'regular'
  },
  textFont: {
    fontFamily: 'regular'
  },
});

const mapStateToProps = function(state) {
  return {
    rKat: state.dashboard.category,
    rKommon: state.dashboard.commonCategory,
    tags: state.dashboard.tags,
    //loggedIn: state.auth.loggedIn
  }
}

export default connect(mapStateToProps,dash)(CatOption);

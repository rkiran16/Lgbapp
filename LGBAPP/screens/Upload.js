import * as React from 'react';
import { StatusBar, Image, StyleSheet, Platform, ScrollView, TouchableOpacity, AsyncStorage, ImageBackground, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker'
import { Camera } from 'expo-camera'
import * as Permissions from 'expo-permissions'
import { connect } from 'react-redux';
import * as dash from '../store/actions/dashboard';
import { Block, Text, theme } from "galio-framework";
import { argonTheme, Images, Util } from "../constants/";
import Utoolbar from "../components/UploadToolbar";
import { Button, Spinner } from "../components";
import { 
    Ionicons,
    MaterialIcons,
  } from '@expo/vector-icons';


const flashModeOrder = {
    off: 'on',
    on: 'auto',
    auto: 'torch',
    torch: 'off',
  };
  
  const flashIcons = {
    off: 'flash-off',
    on: 'flash-on',
    auto: 'flash-auto',
    torch: 'highlight'
  };
  
  const wbOrder = {
    auto: 'sunny',
    sunny: 'cloudy',
    cloudy: 'shadow',
    shadow: 'fluorescent',
    fluorescent: 'incandescent',
    incandescent: 'auto',
  };
  
const wbIcons = {
    auto: 'wb-auto',
    sunny: 'wb-sunny',
    cloudy: 'wb-cloudy',
    shadow: 'beach-access',
    fluorescent: 'wb-iridescent',
    incandescent: 'wb-incandescent',
};

let TouchableCmp = TouchableOpacity;

if (Platform.OS === 'android' && Platform.Version <= 5) {
    TouchableCmp = TouchableNativeFeedback;
}

class ImagePickers extends React.Component {
    camera = null
    state = {
        flash: 'off',
        zoom: 0,
        autoFocus: 'on',
        type: 'back',
        whiteBalance: 'auto',
        ratio: '16:9',
        ratios: [],
        newPhotos: false,
        permissionsGranted: false,
        pictureSize: undefined,
        pictureSizes: [],
        pictureSizeId: 0,
        showGallery: false,
        showMoreOptions: false,
        ggal:null,
        image: null,
        captures: [],
        capturing: false,
        flashMode: Camera.Constants.FlashMode.off,
        loading: false, err: false,
        carriedData: null
    };

   
    handleCaptureIn = () => this.setState({ capturing: true });
    handleCaptureOut = () => {
        if (this.state.capturing)
            this.camera.stopRecording();
    };

    handleShortCapture = async () => {
        const photoData = await this.camera.takePictureAsync();
        this.setState({ capturing: false, newPhotos: true, captures: [photoData, ...this.state.captures] })
    };

    handleLongCapture = async () => {
        const videoData = await this.camera.recordAsync();
        this.setState({ capturing: false, newPhotos: true, captures: [videoData, ...this.state.captures] });
    };

    async componentWillMount() {
        await this.getIncomingRoute();
        await this.getPermissionAsync();
    }

    getIncomingRoute() {
        const { navigation } = this.props;
        const carriedData = navigation.getParam('carriedData', null);
        this.setState({ggal: navigation.getParam('incomingRoute', null), carriedData:carriedData});
    }

    getRatios = async () => {
        const ratios = await this.camera.getSupportedRatios();
        return ratios;
    };

    toggleMoreOptions = () => this.setState({ showMoreOptions: !this.state.showMoreOptions });

    toggleFacing = () => this.setState({ type: this.state.type === 'back' ? 'front' : 'back' });

    toggleFlash = () => this.setState({ flash: flashModeOrder[this.state.flash] });

    setRatio = ratio => this.setState({ ratio });

    toggleWB = () => this.setState({ whiteBalance: wbOrder[this.state.whiteBalance] });

    toggleFocus = () => this.setState({ autoFocus: this.state.autoFocus === 'on' ? 'off' : 'on' });

    zoomOut = () => this.setState({ zoom: this.state.zoom - 0.1 < 0 ? 0 : this.state.zoom - 0.1 });

    zoomIn = () => this.setState({ zoom: this.state.zoom + 0.1 > 1 ? 1 : this.state.zoom + 0.1 });

    setFocusDepth = depth => this.setState({ depth });

    collectPictureSizes = async () => {
        if (this.camera) {
          const pictureSizes = await this.camera.getAvailablePictureSizesAsync(this.state.ratio);
          let pictureSizeId = 0;
          if (Platform.OS === 'ios') {
            pictureSizeId = pictureSizes.indexOf('High');
          } else {
            // returned array is sorted in ascending order - default size is the largest one
            pictureSizeId = pictureSizes.length-1;
          }
          this.setState({ pictureSizes, pictureSizeId, pictureSize: pictureSizes[pictureSizeId] });
        }
    };

    previousPictureSize = () => this.changePictureSize(1);
    nextPictureSize = () => this.changePictureSize(-1);

    changePictureSize = direction => {
        let newId = this.state.pictureSizeId + direction;
        const length = this.state.pictureSizes.length;
        if (newId >= length) {
            newId = 0;
        } else if (newId < 0) {
            newId = length -1;
        }
        this.setState({ pictureSize: this.state.pictureSizes[newId], pictureSizeId: newId });
    }

    renderTopBar = () => 
        <Block style={styles.topBar}>
            <TouchableCmp style={styles.toggleButton} onPress={this.toggleFacing}>
                <Ionicons name="ios-reverse-camera" size={32} color="white" />
            </TouchableCmp>
            <TouchableCmp style={styles.toggleButton} onPress={this.toggleFlash}>
                <MaterialIcons name={flashIcons[this.state.flash]} size={32} color="white" />
            </TouchableCmp>
            <TouchableCmp style={styles.toggleButton} onPress={this.toggleWB}>
                <MaterialIcons name={wbIcons[this.state.whiteBalance]} size={32} color="white" />
            </TouchableCmp>
            <TouchableCmp style={styles.toggleButton} onPress={this.onBackPress}>
                <Text style={[styles.autoFocusLabel, { color: "white" }]}>NEXT</Text>
                {this.state.newPhotos && <Block style={styles.newPhotosDot}/>}
            </TouchableCmp>   
        </Block>

    renderNoPermissions = () => 
        <View style={styles.noPermissions}>
        <Text style={{ color: 'white' }}>
            Camera permissions not granted - cannot open camera preview.
        </Text>
        </View>
    
    renderMoreOptions = () =>
      <Block style={styles.options}>
        <Block style={styles.pictureSizeContainer}>
          <Text style={styles.pictureQualityLabel}>Picture quality</Text>
          <Block style={styles.pictureSizeChooser}>
            <TouchableCmp onPress={this.previousPictureSize} style={{ padding: 6 }}>
              <Ionicons name="md-arrow-dropleft" size={14} color="white" />
            </TouchableCmp>
            <Block style={styles.pictureSizeLabel}>
              <Text style={{color: 'white'}}>{this.state.pictureSize}</Text>
            </Block>
            <TouchableCmp onPress={this.nextPictureSize} style={{ padding: 6 }}>
              <Ionicons name="md-arrow-dropright" size={14} color="white" />
            </TouchableCmp>
          </Block>
        </Block>
      </Block> 

    onBackPress = async () => {
        if(this.state.captures && this.state.captures.length > 0) {
            await this.props.getAllImageSubmit(this.state.captures, this.state.carriedData);
            this.props.navigation.navigate(this.state.ggal, {
                rUpload: this.state.captures, carriedData: this.state.carriedData
            }) 
        }
    }

    getPermissionAsync = async () => {
        this.setState({loading: true});
        try {
        const permit = await Permissions.getAsync(Permissions.CAMERA_ROLL);
            if (permit.status !== 'granted') {
                const newPermission = await Permissions.askAsync(Permissions.CAMERA_ROLL);
                if (newPermission.status === 'granted') {
                    //its granted.
                } else {
                    alert('Permission is denied for camera, go to settings to allow LGB Access');
                }
            }
        const { status } = await Permissions.askAsync(Permissions.CAMERA);
            if (status !== 'granted') {
                alert('Permission is denied for camera, go to settings to allow LGB Access');
            }
        const audio = await Permissions.askAsync(Permissions.AUDIO_RECORDING);
            if (audio.status !== 'granted') {
                alert('Permission is denied for recording, go to settings to allow LGB Access');
            }
        this.setState({ permissionsGranted: status === 'granted' });
        this.setState({loading: false});
        }catch(err){
            this.setState({err:true})
            this.setState({loading: false});
        }
        return;
    }

    _gallery = ({captures = []}) => {
        return ( 
            <ScrollView 
                horizontal={true}
                flex={1}
                showsHorizontalScrollIndicator = {false}
                style={styles.gallery}>
                {captures.map(({ uri }) => (
                    <Block style={styles.galleryImageContainer} key={uri}>
                        <Image source={{ uri }} style={styles.galleryImage} />
                    </Block>
                ))}
            </ScrollView>
        );
    }


  render() {
    if (this.state.loading) {
        return (
            <Block style={{...styles.centered, backgroundColor: argonTheme.COLORS.GRADIENT_START }}>
                <Spinner label='loading camera...' style={{color:argonTheme.COLORS.WHITE}} color={argonTheme.COLORS.GRADIENT_END} />
            </Block>
        );
    }
    let { permissionsGranted, capturing, captures } = this.state;
   if (this.state.err===true || permissionsGranted === false) {
        return (
            <Block flex style={styles.errorStyles}>
                <Block flex>
                    <ImageBackground
                    source={Images.ProfileBackground}
                    style={{ width: Util.width, height: Util.height, zIndex: 1 }}
                    >
                    <Block style={styles.centered}>
                        <Text size={20} style={{...styles.textFont, marginBottom:5}}>Camera permission error occurred!</Text>
                        <Button shadowless onPress={this.getPermissionAsync} style={styles.errBtn}>
                        <Block row space="between">
                            <Text style={styles.textFont} size={16} color={ Platform.OS === 'android' ? 'white' : argonTheme.COLORS.GRADIENT_START}> Try Again!</Text>
                        </Block>
                        </Button>
                    </Block>
                    </ImageBackground>
                </Block>
            </Block>
            );
    }
    return (
        <Camera ref={camera => this.camera = camera}
        type={this.state.type}
        onCameraReady={this.collectPictureSizes}
        flashMode={this.state.flash}
        autoFocus={this.state.autoFocus}
        zoom={this.state.zoom}
        whiteBalance={this.state.whiteBalance}
        ratio={this.state.ratio}
        pictureSize={this.state.pictureSize}
        style={{ flex: 1, backgroundColor: 'black' }}>
            <StatusBar hidden />
            <Block column flex style={{ flexDirection: 'column', justifyContent: 'space-between'}}>
                {this.renderTopBar()}
                <Block style={{ flex: 4, alignItems: 'center', justifyContent: 'center' }}>
                </Block>
                {captures.length > 0 && this._gallery(captures={captures})}
                <Block style={styles.selectBlk}>
                    <Utoolbar
                        nPhotos = {this.state.newPhotos}
                        galleryPick = {this._pickImage}
                        moreOptions = {this.toggleMoreOptions}
                        capturing={capturing}
                        onCaptureIn={this.handleCaptureIn}
                        onCaptureOut={this.handleCaptureOut}
                        onShortCapture={this.handleShortCapture}
                        onLongCapture={this.handleLongCapture} />
                </Block>
                {this.state.showMoreOptions && this.renderMoreOptions()}
            </Block>
        </Camera>
    );
  }

  _pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        aspect: [8, 8],
        base64: true,
        quality: 0.9
    });


    if (!result.cancelled) {
        this.setState({ newPhotos: true, captures: [result, ...this.state.captures] })
        //this.setState({ image: result.uri });
    }
  };
}

const styles = StyleSheet.create({
    errorStyles: {
        marginTop: Platform.OS === "android" ? - Util.HeaderHeight : 0,
        // marginBottom: -HeaderHeight * 2,
        flex: 1,
        backgroundColor: argonTheme.COLORS.GRADIENT_START
    },
    textFont: {
        fontFamily: 'regular'
    },
    centered: { 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center',
      },
    errBtn:{
        width: theme.SIZES.BASE * 8,
        backgroundColor: Platform.OS === "android" ? argonTheme.COLORS.GRADIENT_START : 'transparent'
    },
    options: {
        position: 'absolute',
        bottom: Util.iPhoneX ? 120 : 50,
        left: 30,
        width: 200,
        height: 80,
        backgroundColor: '#000000BA',
        borderRadius: 4,
        padding: 10,
    },
    pictureQualityLabel: {
        fontSize: 10,
        marginVertical: 3, 
        color: 'white'
    },
    pictureSizeContainer: {
        flex: 0.5,
        alignItems: 'center',
        paddingTop: 10,
    },
    pictureSizeChooser: {
        alignItems: 'center',
        justifyContent: 'space-between',
        flexDirection: 'row'
    },
    pictureSizeLabel: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    topBar: {
        flex: 0.3,
        backgroundColor: 'transparent',
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingTop: theme.SIZES.BASE * 3,
    },
    autoFocusLabel: {
        paddingTop: theme.SIZES.BASE * 0.5,
        fontSize: 20,
        fontWeight: 'bold'
    },
    newPhotosDot: {
        position: 'absolute',
        top: 4,
        right: -5,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#4630EB'
    },
    selectBlk: {
        flex: 0.8,
        width: Util.width,
        height: theme.SIZES.BASE * 4,
        backgroundColor: 'transparent',
        //alignItems: 'flex-end',
        marginBottom: Platform.OS === 'ios' ? 2 : 2,
        zIndex: 800
    },
    gallery: {
        flex: 0.2,
        height: theme.SIZES.BASE,
        backgroundColor: 'transparent',
        width: Util.width,
        bottom: 0,
        padding: 1,
    },
    galleryImageContainer: { 
        width: 85, 
        height: 85, 
        marginRight: 5,
        backgroundColor: argonTheme.COLORS.WHITE,
        borderRadius: 5,
        flex: 1, 
        alignItems: 'center', 
        justifyContent: 'center'
    },
    galleryImage: { 
        width: 82, 
        height: 82,
        borderRadius: 4
    }
})

export default connect(null,dash)(ImagePickers);
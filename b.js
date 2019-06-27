/* eslint no-use-before-define: ["error", { "variables": false }] */

import PropTypes from 'prop-types';
import React from 'react';
import {
  Text,
  Clipboard,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
  ViewPropTypes,
  Alert,
  Keyboard,
  TouchableOpacity,
  Modal,
  Animated,
  Easing,
  ScrollView,
  WebView,
  Image,
  Linking,
  Dimensions,
  FlatList,
  TouchableHighlight,ImageBackground
} from 'react-native';

import {
  // MessageText,
  // MessageImage,
  Time,
} from 'react-native-gifted-chat';
import { Actions } from 'react-native-router-flux';
import { CachedImage } from 'react-native-img-cache';
import { Icon } from 'react-native-elements';

import { Network, AppColors } from 'roverz-chat';
import MessageText from './MessageText';
import MessageImage from './MessageImage';
// import Time from './Time';

import { isSameUser, isSameDay, warnDeprecated } from './utils';

import t from '../../../i18n';
import Color from './Color';
import Constants from './models/constants';
import moment from 'moment';
import * as Progress from 'react-native-progress';

const { width } = Dimensions.get('window');
const Height = Dimensions.get('window').height;
const Width = Dimensions.get('window').width;

const iconColor = AppColors.brand().bubble_iconColor;
const allergy = require('./images/allergyicon.png');
const appointment = require('./images/appointmenticon.png');
const result = require('./images/labicon.png');
const medication = require('./images/medicationicon.png');
const immunization = require('./images/immunizationicon.png');
const condition = require('./images/conditionicon.png');

 const dataS=[
{url:immunization,name:'Immunizations'}, 
{url:medication,name:'Medications'},
{url:allergy,name:'Allergies'},
 {url:result,name:'Lab Results'},
{url:appointment,name:'Appointments'},
{url:condition,name:'Problems'},
       ];
//   const dataS=[
// {url:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTlAw4T8aRtLu8WgtcqiY8OEmzPlucG1G2bewyEh9Jn0pkJaGr_Hg",name:'Immunizations'}, 
// {url:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSXy1MuAKOKf3GJWHKM7S5f6pcDNySi9Vb9jnDILTofiveth5MxVg",name:'Medications'},
// {url:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRSQ8q2JzZz5KeSJagAbRyOTQD82L6ql3Mxfg8cXn4gg7Vb9lS8",name:'Allergies'},
//  {url:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTi7ZiDcF_Xcy_W7zGs4H4KyEIMxqe6y9HY_L_G-0-1HjDfl4N91g",name:'Lab Results'},
// {url:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRSUEaQrHli7roDpS7rIfS-l7PCAPi-rA1jWY1_SEazNLet6Gw3jQ",name:'Appointments'},
// {url:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQaTudZJT7GzJcVvJHb0n9oljWRO3hJt-Yip16wuCq_4acMRS3K",name:'Problems'},
//        ];
const styl = StyleSheet.create({
  bubbleView: {
    width: '100%',
    height: 1,
    backgroundColor: AppColors.brand().bubble_bubbleViewBg,
  },
  bubbleText: {
    paddingLeft: 5,
    fontSize: 12,
    fontWeight: '800',
    fontFamily: 'OpenSans-Regular',
    color: AppColors.brand().bubble_bubbleTextColor,
  },
  modalAction: {
    flex: 1,
    backgroundColor: AppColors.brand().bubble_modalActionBg,
    alignItems: 'center',
    justifyContent: 'center',
    // padding: 45,
  },
  animated: {
    backgroundColor: AppColors.brand().bubble_animatedBg,
    // borderRadius: 5,
    // padding: 5,
    width: width / 1.6,
  },
  likeText: {
    fontFamily: 'OpenSans-Regular',
    fontSize: 12,
    color: AppColors.brand().bubble_likeTextColor,
  },
});


export default class Bubble extends React.Component {

  constructor(props) {
    super(props);
    this.onLongPress = this.onLongPress.bind(this);
    this._network = new Network();
    this.obj = this.props.obj;
    this.roomType = this.obj.type;
    this.pressLong = this.pressLong.bind(this);
    const likes = this.props.currentMessage.likes;
    const isReply = this.props.currentMessage.isReply;
    const original = JSON.parse(this.props.currentMessage.original);
    const canDelete = this._network.service.canDelete(original);
    this.state = {
      roomType: this.roomType,
      showActions: false,
      likes,
      isReply,
      original,
      parentMessage: null,
      canDelete,
      actionsModal: false,
      check: false,
      modalVisible:false
    };
    this.handleMsgCopy = this.handleMsgCopy.bind(this);
    this.handleActionPress = this.handleActionPress.bind(this);
  }

  componentWillMount() {
     this.setState({check:true})
    const _super = this;
    if (this.state.isReply) {
      // let getReplyMess = this.obj.findMessageById(this.props.currentMessage.replyMessageId);
      // while (getReplyMess && getReplyMess.isReply) {
      //   getReplyMess = this.obj.findMessageById(getReplyMess.replyMessageId);
      // }
      // this._network.chat.fixYapImageUrls(Array.prototype.slice.call([replyMessage]),
      const getReplyMess = this.obj.findRootMessage(this.props.currentMessage.replyMessageId);
      if (getReplyMess) {
        const replyMessage = [getReplyMess];
        this.prepareMessages(replyMessage, (parentMessage) => {
          _super.setState({
            parentMessage: parentMessage[0],
          });
        });
      }
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.currentMessage) {
      this.setState({
        likes: nextProps.currentMessage.likes,
      });
    }
  }

  onLongPress() {
    if (this.props.onLongPress) {
      this.props.onLongPress(this.context, this.props.currentMessage);
    } else if (this.props.currentMessage.text) {
      const options = ['Copy Text', 'Cancel'];
      const cancelButtonIndex = options.length - 1;
      this.context.actionSheet().showActionSheetWithOptions(
        {
          options,
          cancelButtonIndex,
        },
        (buttonIndex) => {
          switch (buttonIndex) {
            case 0:
              Clipboard.setString(this.props.currentMessage.text);
              break;
            default:
              break;
          }
        },
      );
      // this.toggleActions();
    }
  }
 setModalVisible(visible) {
    this.setState({modalVisible: visible});
  }
  toggleActions = () => {
    // const action = this.state.showActions;
    // this.setState({ showActions: !action });
    const action = this.state.actionsModal;
    this.setState({ actionsModal: !action });
  }

  toggleModalActions = () => {
    const action = this.state.actionsModal;
    this.setState({ actionsModal: !action });
    this.animatedValue = new Animated.Value(0.8);
    Animated.timing(this.animatedValue, {
      toValue: 1,
      duration: 200,
      easing: Easing.sin,
    }).start();
  }

  _onPressLike = () => {
    console.log('**** like pressed **** ');
    this._network.service.setLike(this.state.original._id);
    this.toggleModalActions();
  }

  _handleDelete = () => {
    this._network.service.deleteMessage(this.state.original._id, (err, msg) => {
      console.log('deleteMessage', err, msg);
      if (err) {
        Alert.alert(
          t('info_delete_err'),
          t('info_del_not_allowed'),
          [
            { text: t('txt_ok') },
          ],
          { cancelable: false },
        );
      }
    });
  }

  _deleteMessage = () => {
    this.setState({ actionsModal: false });
    setTimeout(() => {
      Alert.alert(
        t('info_delete'),
        t('info_del_message'),
        [
          { text: t('txt_no'), onPress: () => {}, style: 'cancel' },
          { text: t('txt_yes'),
            onPress: () => this._handleDelete(),
          },
        ],
        { cancelable: false },
      );
    }, 100);
  }

  _handleComments = () => {
    /*
    text !this.state.original.file, this.state.parentMessage=null
    img this.state.original.file, this.state.parentMessage=null
    text - text reply !this.state.original.file, this.state.parentMessage!=null
    img -text reply this.state.original.file, this.state.parentMessage!=null
    */
    if (!this.state.original.file && this.state.parentMessage === null) {
      Keyboard.dismiss();
      Actions.replyMessage({
        obj: this.props.obj,
        msgId: this.props.currentMessage._id,
        actualMessage: this.props.currentMessage.text,
        msgLikes: this.props.currentMessage.likes,
        msgTitle: this.props.currentMessage.text,
        canDelete: this.state.canDelete,
      });
    } else if (this.state.original.file && this.state.parentMessage === null) {
      Keyboard.dismiss();
      Actions.imagePreview({
        imageUri: this.props.currentMessage.image,
        obj: this.props.obj,
        msgId: this.props.currentMessage._id,
        msgLikes: this.props.currentMessage.likes,
        msgTitle: this.props.currentMessage.text,
        canDelete: this.state.canDelete,
      });
    } else if (!this.state.original.file && this.state.parentMessage !== null) {
      if (this.state.parentMessage.image) {
        Keyboard.dismiss();
        Actions.imagePreview({
          imageUri: this.state.parentMessage.image,
          obj: this.props.obj,
          msgId: this.state.parentMessage._id,
          msgLikes: this.state.parentMessage.likes,
          msgTitle: this.state.parentMessage.text,
          canDelete: this.state.canDelete,
        });
      } else {
        Keyboard.dismiss();
        Actions.replyMessage({
          obj: this.props.obj,
          msgId: this.state.parentMessage._id,
          actualMessage: this.state.parentMessage.text,
          msgLikes: this.state.parentMessage.likes,
          msgTitle: this.state.parentMessage.text,
          canDelete: this.state.canDelete,
        });
      }
    } else if (this.state.original.file && this.state.parentMessage !== null) {
      Keyboard.dismiss();
      Actions.imagePreview({
        imageUri: this.state.parentMessage.image,
        obj: this.props.obj,
        msgId: this.state.parentMessage._id,
        msgLikes: this.state.parentMessage.likes,
        msgTitle: this.state.parentMessage.text,
        canDelete: this.state.canDelete,
      });
    }
    this.toggleModalActions();
  }

  _handleCopy = () => {
    Clipboard.setString(this.props.currentMessage.text);
    this.handleMsgCopy();
    this.toggleModalActions();
  }

  prepareMessages(messages, callback) {
    this._network.chat.fixYapImageUrls(Array.prototype.slice.call(messages), (msg) => {
      callback(msg);
    });
  }

  handleBubbleToNext() {
    if (
      isSameUser(this.props.currentMessage, this.props.nextMessage) &&
      isSameDay(this.props.currentMessage, this.props.nextMessage)
    ) {
      return StyleSheet.flatten([
        styles[this.props.position].containerToNext,
        this.props.containerToNextStyle[this.props.position],
      ]);
    }
    return null;
  }

  handleBubbleToPrevious() {
    if (
      isSameUser(this.props.currentMessage, this.props.previousMessage) &&
      isSameDay(this.props.currentMessage, this.props.previousMessage)
    ) {
      return StyleSheet.flatten([
        styles[this.props.position].containerToPrevious,
        this.props.containerToPreviousStyle[this.props.position],
      ]);
    }
    return null;
  }

  pressLong = () => {
    this.toggleModalActions();
  }
handleMenuPress(button) {
  console.log(button,'button');
    const message = button;
    this._network.service.sendMessage(
      this.obj,
      message,
    );
  }
  handleActionPress(button) {
    const message = button.payload;
    this._network.service.sendMessage(
      this.obj,
      message,
    );
  }

  handleMsgCopy() {
    this.props.msgCopy();
  }

  urlDescSplit(desc) {
    if (desc.length > 35) {
      let newLable = '';
      const len = desc.length / 35;
      for (let i = 0, j = 0; j < len; i += 35, j += 1) {
        newLable += `${desc.slice(i, i + 35)}`;
        newLable += '\n';
      }
      return newLable;
    }
    return desc;
  }

  renderDelete() {
    if (this.state.canDelete) {
      return (
        <TouchableOpacity
          style={[styles.actionBtn]}
          onPress={this._deleteMessage}
        >
          <Image
            source={require('../../../images/messages_details_popup/del.png')}
            style={{ height: 35, width: 35 }}
          />
          <Text style={styl.bubbleText}>{t('txt_delete')}</Text>
        </TouchableOpacity>);
    }
    return null;
  }

  renderActionsModal() {
    const animatedStyle = { transform: [{ scale: this.animatedValue }] };
    if (this.state.actionsModal) {
      return (
        <Modal
          animationType={'none'}
          transparent={true}
          visible={this.state.modalVisible}
          onRequestClose={() => {
            // alert('Modal has been closed.');
          }}
        >
          <TouchableOpacity
            style={styl.modalAction}
            onPress={this.toggleModalActions}
          >
            <Animated.View
              style={[styl.animated, animatedStyle]}
            >
              <View style={{ borderBottomWidth: 5, borderColor: '#E57D24' }}>
                <View style={{ backgroundColor: '#006B87', height: 35, alignItems: 'flex-end', justifyContent: 'center', padding: 5 }}>
                  <TouchableOpacity onPress={this.toggleModalActions}>
                    <View>
                      <Image
                        source={require('../../../images/messages_details_popup/del.png')}
                        style={{ height: 20, width: 20 }}
                      />
                    </View>
                  </TouchableOpacity>
                </View>
                <View
                  style={{
                    alignItems: 'flex-start',
                    // padding: 3,
                    flexDirection: 'column',
                    paddingVertical: 10,
                  }}
                >
                  <TouchableOpacity
                    style={[styles.actionBtn]}
                    onPress={this._onPressLike}
                  >
                    <View style={styles.iconContainer}>
                      <Image
                        source={require('../../../images/messages_details_popup/like.png')}
                        style={{ height: 40, width: 40 }}
                      />
                    </View>
                    <Text style={styl.bubbleText}>{t('txt_like_txt')}</Text>
                  </TouchableOpacity>
                  {/* <View style={styl.bubbleView} /> */}
                  <TouchableOpacity
                    style={[styles.actionBtn]}
                    onPress={this._handleComments}
                  >
                    <View style={styles.iconContainer}>
                      <Image
                        source={require('../../../images/messages_details_popup/reply.png')}
                        style={{ height: 40, width: 40 }}
                      />
                    </View>
                    <Text style={styl.bubbleText}>{t('txt_rply')}</Text>
                  </TouchableOpacity>
                  {/* <View style={styl.bubbleView} /> */}
                  {
                    !this.props.currentMessage.image &&
                    (
                      <TouchableOpacity
                        style={[styles.actionBtn]}
                        onPress={this._handleCopy}
                      >
                        <View style={styles.iconContainer}>
                          <Image
                            source={require('../../../images/messages_details_popup/copy.png')}
                            style={{ height: 40, width: 40 }}
                          />
                        </View>
                        <Text style={styl.bubbleText}>{t('txt_copy')}</Text>
                      </TouchableOpacity>
                    )
                  }
                  {/* <View style={styl.bubbleView} /> */}
                  {this.renderDelete()}
                </View>
              </View>
            </Animated.View>
          </TouchableOpacity>
        </Modal>
      );
    }
  }

  renderMessageText() {
    if (this.props.currentMessage.text) {
      const messageAsObject = this.props.currentMessage.text;
      let msgObj = null;
      try {
        msgObj = JSON.parse(messageAsObject);
        // alert(JSON.stringify(msgObj));
        this.props.currentMessage.JUSTFORTESTING = msgObj;
        this.props.currentMessage.text = msgObj.msg;
      } catch (error) {
        console.log('error');
      }
      const { containerStyle, wrapperStyle, ...messageTextProps } = this.props;
      if (this.props.renderMessageText) {
        return this.props.renderMessageText(messageTextProps);
      }
      return <MessageText {...messageTextProps} />;
    }

    const { original } = this.props.currentMessage;
    let originalObj = null;
    try {
      originalObj = JSON.parse(original);
    } catch (error) {
      return null;
    }

    if (originalObj.text) {
      const { containerStyle, wrapperStyle, ...messageTextProps } = this.props;
      messageTextProps.currentMessage.text = originalObj.text;
      if (this.props.renderMessageText) {
        return this.props.renderMessageText(messageTextProps);
      }
     
      return <MessageText {...messageTextProps} />;
    } 
  //   else if(originalObj.url){
         
  //    return (
  //      //oldmenu
  // //   (<View style={{marginTop:100,alignItems:'center',justifyContent:'center'}}>
  // //      <FlatList
  // //   data={dataS}
  // // numColumns={3}
  // // renderItem={({item}) => 
  // // <View style={{height:180,width:120,borderColor:'darkorange',backgroundColor:'dodgerblue',borderWidth:5}}>
  // // <TouchableOpacity onPress={()=>this.handleMenuPress(item.name)}>
  // //   <Image style={{borderRadius:50,margin:30,width:50,height:50,resizeMode:'contain'}} source={{uri:item.url}}></Image>
  // //   <View style={{alignItems:'center',justifyContent:'center'}}><Text style={{fontSize:15,color:'white'}}>{item.name}</Text></View>
  // //   </TouchableOpacity>
  // // </View>}

  // //   />
    
  // // </View>)
  // <View style={{marginRight:60,marginBottom:40}}>
  // <FlatList
  //   data={dataS}
  // numColumns={2}
  // renderItem={({item}) => 
  // <View style={{borderColor:'transparent',backgroundColor:"transparent",borderWidth:5}}>
  // <TouchableOpacity onPress={()=>this.handleMenuPress(item.name)}>
  // <View style={{height:95,width:140,borderColor:'gray',borderWidth:1,borderRadius:5}}>

  //   <View style={{flexDirection:'row'}}>
  //     <Image style={{borderRadius:10,margin:5,marginLeft:35,width:50,height:50,resizeMode:'contain'}} source={item.url}></Image>
  //      <View style={{ margin:10,height:25,width:25,backgroundColor:'red',borderRadius:25 }}>
  //       <Text style={{fontSize:10,marginTop:5,textAlign:'center',color:'white'}}>11</Text>
  //     </View>
  //   </View>
  //   <View style={{marginTop:10,alignItems:'center',justifyContent:'center'}}><Text style={{fontWeight:'bold',fontSize:15,color:'gray'}}>{item.name}</Text></View>
  //   </View>
  //   </TouchableOpacity>
  // </View>}

  //   />
  //   </View>
  //   );
  
    
  //     }
    return null;
  }

  renderMessageTextWrapper() {
    return (
      <View>
        {
          !this.props.currentMessage.image && (
            <View
              style={{
                flex: 1,
                marginRight: 5,
                marginTop: 5,
                alignItems: 'flex-end',
              }}
            >
              {this.renderLikes()}
            </View>
          )
        }
        {this.renderMessageText()}
      </View>
    );
  }

  renderReply() {
    const { replyStyle } = this.props;
    if (this.state.parentMessage) {
      return (
        <View
          style={[
            styles.replyWrapper,
            styles[this.props.position].replyContainer,
            replyStyle[this.props.position].replyBubble,
          ]}
        >
          <View
            style={{
              flexDirection: 'column',
              minWidth: 100,
            }}
          >
            <Text
              style={[
                styles[this.props.position].replyText,
                replyStyle[this.props.position].replyText,
                { fontWeight: '500' },
              ]}
              numberOfLines={1}
            >{`${this.state.parentMessage.user.name}:`}</Text>
            <Text
              style={[
                styles[this.props.position].replyText,
                replyStyle[this.props.position].replyText,
              ]}
            >{this.state.parentMessage.text}</Text>
          </View>
          {
            (this.state.parentMessage.image &&
              <CachedImage
                style={{
                  width: 50,
                  height: 50,
                  marginLeft: 5,
                  borderRadius: 2 }}
                source={{ uri: this.state.parentMessage.image }}
              />
            )
          }
        </View>
      );
    }
  }

  renderMessageImage() {
    if (this.props.currentMessage.image || this.props.currentMessage.video) {
      const { containerStyle, wrapperStyle, ...messageImageProps } = this.props;
      if (this.props.renderMessageImage) {
        return this.props.renderMessageImage(messageImageProps);
      }
      return <MessageImage {...messageImageProps} />;
    }
    return null;
  }

  renderTicks() {
    const { currentMessage } = this.props;
    if (this.props.renderTicks) {
      return this.props.renderTicks(currentMessage);
    }
    if (currentMessage.user._id !== this.props.user._id) {
      return null;
    }
    if (currentMessage.sent || currentMessage.received) {
      return (
        <View style={styles.tickView}>
          {currentMessage.sent && <Text style={[styles.tick, this.props.tickStyle]}>✓</Text>}
          {currentMessage.received && <Text style={[styles.tick, this.props.tickStyle]}>✓</Text>}
        </View>
      );
    }
    return null;
  }

  renderTime() {
    if (this.props.currentMessage.createdAt) {
      const { containerStyle, wrapperStyle, ...timeProps } = this.props;
      if (this.props.renderTime) {
        return this.props.renderTime(timeProps);
      }
      return <Time {...timeProps} />;
    }
    return null;
  }

  renderUsername() {
    if (this.state.roomType !== Constants.G_DIRECT) {
      if ((this.props.currentMessage.image || this.props.currentMessage.video) ||
      !isSameUser(this.props.currentMessage, this.props.previousMessage)) {
        const username = this.props.currentMessage.user.name;
        if (username) {
          console.log('renderUsername', username);
          const { containerStyle, wrapperStyle, ...usernameProps } = this.props;
          if (this.props.renderUsername) {
            return this.props.renderUsername(usernameProps);
          }
          return (
            <Text style={[styles.standardFont, styles.headerItem, styles.username, this.props.usernameStyle]}>
              {username}:
            </Text>
          );
        }
        return null;
      }
    }
  }


  renderCustomView() {
    // if (this.props.renderCustomView) {
    //   return this.props.renderCustomView(this.props);
    // }
    // return null;
    let cvStyle = {};
    if (this.props.currentMessage.image || this.state.parentMessage != null) {
      cvStyle = {
        position: 'absolute',
        top: 5,
        right: 0,
        zIndex: 999,
      };
    } else {
      cvStyle = {
        alignItems: 'flex-end',
      };
    }
    return (
      <View
        style={cvStyle}
      >
        {this.renderLikes()}
      </View>
    );
  }

  renderLikes() {
    if (this.state.likes) {
      return (
        <View style={{
          backgroundColor: AppColors.brand().secondary,
          flexDirection: 'row',
          height: 24,
          minWidth: 40,
          maxWidth: 60,
          padding: 3,
          borderTopLeftRadius: 3,
          borderBottomLeftRadius: 3,
          justifyContent: 'center',
          alignItems: 'center',
        }}
        >
          <Icon
            name={'heart-outline'}
            type={'material-community'}
            size={16}
            color={iconColor}
          />
          <Text
            style={styl.likeText}
          >{this.state.likes > 0 ? this.state.likes : t('txt_like')}</Text>
        </View>
      );
    }
  }

  renderActions() {
    if (this.state.showActions) {
      return (
        <View
          style={{
            marginHorizontal: 5,
          }}
        >
          <View
            style={{
              alignItems: 'flex-start',
              padding: 3,
              flexDirection: 'row',
              marginVertical: 5,
            }}
          >
            <TouchableOpacity
              style={[styles.actionBtn]}
              onPress={this._onPressLike}
            >
              <Icon
                name={'heart-outline'}
                type={'material-community'}
                size={22}
                color={iconColor}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn]}
              onPress={this._handleComments}
            >
              <Icon
                name={'comment-text-outline'}
                type={'material-community'}
                size={22}
                color={iconColor}
              />
            </TouchableOpacity>
            {
              !this.props.currentMessage.image &&
              (
                <TouchableOpacity
                  style={[styles.actionBtn]}
                  onPress={this._handleCopy}
                >
                  <Icon
                    name={'content-copy'}
                    type={'material-community'}
                    size={22}
                    color={iconColor}
                  />
                </TouchableOpacity>
              )
            }
            {/* {this.renderDelete()} */}
          </View>
        </View>
      );
    }
  }
renderload(){
   return (
      <View style={{marginBottom:40}}>
      <Text>......</Text>
      </View>
    );
}
  renderLabel(action) {
    let newLabel = '';
    const label = action.label.split(' ');
    for (let i = 0; i < label.length; i += 1) {
      newLabel += ` ${label[i]}`;
      if (i % 4 === 0 && i !== 0) {
        newLabel += '\n';
      }
    }
    return newLabel;
  }

  renderSuggestions() {
    // const text = this.props.currentMessage.text;
    if (this.props.currentMessage._id === this.obj.lastMessage._id) {
      const { original } = this.props.currentMessage;
      let originalObj = null;
      // alert(JSON.stringify(this.obj.lastMessage));
      try {
        originalObj = JSON.parse(original);
      } catch (error) {
        return null;
      }
      if (originalObj.attachment) {
        // show attachments from the message
        if (originalObj.attachment.type === 'template') {
          const template = originalObj.attachment;
          // Show custom template for the attachment
          if (template.payload.template_type === 'button') {
            return (
              <ScrollView
                directionalLockEnabled={false}
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                style={{ flexDirection: 'row' }}
              >
                {
                  template.payload.buttons.map((button) => {
                    if (button.title) {
                      return (
                        <TouchableOpacity
                          style={{
                            paddingHorizontal: 10,
                            paddingVertical: 5,
                            margin: 5,
                            backgroundColor: '#fff',
                            alignItems: 'center',
                            borderColor: '#808080',
                            borderWidth: 1,
                            borderRadius: 20,
                            justifyContent: 'center',
                            marginBottom:30
                          }}
                          key={button.id}
                          onPress={() => this.handleActionPress(button)}
                        >
                          <Text style={{ fontSize: 16 }}>
                            {button.title.length <= 20 && button.title}
                            {button.title.length > 20 && this.renderLabel(button)}
                          </Text>
                        </TouchableOpacity>
                      );
                    }
                    return null;
                  })
                }
              </ScrollView>
            );
          } 
          else if(template.payload.template_type === 'card-Immunization'){

// (<FlatList horizontal
// showsHorizontalScrollIndicator={false}
// pagingEnabled={true}
//   data={cardarray}
//   renderItem={({item}) => 
//  <View style={{height:200,width:350,margin:10,borderRadius:50,borderColor:'darkorange',borderWidth:5,backgroundColor:'white',alignItems:'center',justifyContent:'center'}}>
//    <View style={{backgroundColor:'',width:285,fontSize:20}}><Text style={{color:'dodgerblue',fontSize:20}}>{item.name}</Text></View>
//     <View style={{flexDirection:'row'}}>
//     <Image style={{height:100,width:100,resizeMode:'contain'}}source={{uri:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTlAw4T8aRtLu8WgtcqiY8OEmzPlucG1G2bewyEh9Jn0pkJaGr_Hg"}}></Image>
//       <View style={{backgroundColor:''}}> 
//       <Text style={{fontSize:15,color:''}}>Date: {item.date}</Text>
//       <Text style={{fontSize:15,color:''}}>expiration date: {item.expirydate}</Text>
//        <Text style={{fontSize:12,color:''}}>Administered By: {item.site}</Text>
//       <Text style={{fontSize:15,color:''}}>Site:{item.site}</Text>
//        <Text style={{fontSize:15,color:''}}>Route:{item.route}</Text>
//     </View>
//     </View>
//   </View>
// }
// />)
const cardarray=template.payload.elements;
 console.log(cardarray);

 return (
<FlatList horizontal
      pagingEnabled={true}
  data={cardarray}
  renderItem={({item}) => 

   <View style={{marginBottom:80}}>
 <Image style={{
   marginHorizontal:5,
   height:40,
    width: 300,
    resizeMode: 'contain'
  }} source={require('./images/im_4.png')}>

      <View style={{marginLeft:10,marginTop:10,flexDirection:'row'}}> 
       <Image style={{height:15,width:15,resizeMode:'contain'}} source={require('./images/calender.png')}></Image>
       <Text style={{marginLeft:10,color:'white',fontSize:13}}>{moment(item.date).format('ddd,MMM Do YYYY')}</Text>
      </View>
       </Image>
       <View style={{marginHorizontal:5,borderRightWidth:0.5,borderLeftWidth:0.5,borderColor:'black'}}> 
        <View style={{marginTop:10,marginLeft:10,flexDirection:'row'}}> 
       <Image style={{height:40,width:40,resizeMode:'contain'}} source={require('./images/immun.png')}></Image>
       <Text style={{marginLeft:10,fontSize:12,fontWeight:'bold'}}>{item.name}</Text>
      </View>
        
      <View style={{flexDirection:'row',marginLeft:60}} >
         <Text>Administered By</Text>
         <Text style={{marginLeft:20}}>:</Text>
          <Text style={{marginLeft:20,fontSize:10,fontWeight:'bold'}}>{item.manufacturer}</Text>
      </View>
      <View style={{flexDirection:'row',marginTop:10,marginLeft:60}} >
         <Text>Site</Text>
         <Text style={{marginLeft:100}}>:</Text>
          <Text style={{marginLeft:20,fontSize:10,fontWeight:'bold'}}>{item.site}</Text>
      </View>
      <View style={{flexDirection:'row',marginTop:10,marginLeft:60}} >
         <Text>Route</Text>
         <Text style={{marginLeft:90}}>:</Text>
          <Text style={{marginLeft:20,fontSize:10,fontWeight:'bold'}}>{item.route}</Text>
      </View>
      <View style={{flexDirection:'row',marginTop:10}}>
      <View style={{backgroundColor:'#3c3f44',flexDirection:'row',height:40,width:190}}>
       <Image style={{marginLeft:45,marginTop:10,height:20,width:20,resizeMode:'contain'}} source={require('./images/calender.png')}></Image>
       <Text style={{marginLeft:25,marginTop:10,color:'gray',fontSize:10}}>Expiry Date</Text>
       </View>
       <View style={{height:40,width:110,backgroundColor:'darkorange'}}><Text style={{marginLeft:20,marginTop:10,color:'white',fontSize:10}}>{moment(item.expirydate).format('ddd,MMM Do YYYY')}</Text></View>
      </View>
 </View>
 </View>
}
/>
    );

          } else if (template.payload.template_type === 'card-LabResult'){
               const cardarray=template.payload.elements;
 console.log(cardarray);
 return(
 <FlatList horizontal
  data={cardarray}
  renderItem={({item}) => {
   switch(item.category) {
  case "Social History":
  return (
  
  
  <View style={{margin:10,height:300,width:300,borderRightWidth:1,borderColor:'white'}}>
  <View style={{flexDirection:'row'}}>
<Image style={{height:300,width:130,resizeMode:'contain'}} source={require('./images/l_bg2_.png')}>
  <View style={{borderColor:'transparent',borderLeftWidth:50,borderTopLeftRadius:35,height:50,width:180,borderBottomWidth:1,backgroundColor:'#eaecef',marginLeft:115,marginTop:85}}>
      <Text style={{fontSize:10,marginTop:10,color:"black"}}>Category : {item.category}</Text>
   </View>
  <View style={{borderBottomLeftRadius:5,borderBottomRightRadius:5,marginTop:80,height:40,width:300,backgroundColor:'#343538',flexDirection:'row'}}>
  <Image style={{marginTop:5,marginLeft:100,height:20,width:20,resizeMode:'contain'}} source={require('./images/dt.png')}></Image>
    <Text style={{marginTop:5,marginLeft:15,fontSize:14,color:'white'}}>Date  :  {moment(item.date).format('ddd,MMM Do YYYY')}</Text>
 </View>
</Image>
  <View style={{flexDirection:'column'}}>
   <Text style={{fontSize:11,marginTop:140,color:"black"}}>{item.name}</Text>
   <Text style={{fontSize:10,marginTop:10,color:"black"}}>Response :</Text>
   <Text style={{fontSize:15,marginTop:5,color:"black"}}>{item.response}</Text>
  </View> 
 </View>
 
</View>

  );
    break;
  case "Vital Signs":
  if(item.name=="Height/Length Measured"){
return (
<Image style={{margin:10,height:300,width:300,resizeMode:'contain'}} source={require('./images/l_bg4.png')}>
 <View style={{marginTop:75,marginLeft:200}}>
  <Text style={{fontSize:12,fontWeight:'bold'}}>Category: {item.category}</Text>
 </View>
 <Text style={{marginTop:25,marginLeft:15,fontSize:15,fontWeight:'bold'}}>{item.name}</Text>
 <View style={{marginTop:20,flexDirection:'row'}}>
    <Image style={{marginTop:5,marginLeft:15,height:15,width:15,resizeMode:'contain'}} source={require('./images/calender.png')}></Image>
    <Text style={{marginTop:5,marginLeft:15,fontSize:14,color:'white'}}>{moment(item.date).format('ddd,MMM Do YYYY')}</Text>
 </View>
 <View style={{marginTop:10,marginLeft:10}}><Progress.Bar progress={0.75} unfilledColor="#2c2e30" borderColor="#262728" color="darkorange" width={300} /></View>
 <View style={{width:300,marginTop:10,flexDirection:'row',justifyContent:'space-between'}}>
  <Text style={{marginLeft:10,fontSize:10,color:'white'}}>Low  :  {item.low}</Text>
  <Text style={{fontSize:10,color:'white'}}>High  :  {item.high}</Text>
 </View>
 <View style={{marginLeft:50,flexDirection:'row'}}>
   <Text style={{marginTop:30,fontSize:10,color:'white'}}>Result     : </Text>
   <Text style={{marginLeft:20,marginTop:25,fontWeight:'bold',color:'white'}}>{item.value}</Text>
  </View>
</Image>
 );
  } else if(item.name=="Temperature Oral"){
return (
<Image style={{height:300,width:300,resizeMode:'contain'}} source={require('./images/l_bg1_top.png')}>
<View style={{marginTop:70,marginLeft:250}}><Text style={{fontSize:12,fontWeight:'bold'}}>Category: {item.category}</Text></View>
<View style={{marginTop:10,marginLeft:80}}><Text style={{color:'white',fontSize:15}}>{item.name}</Text></View>
    <Image style={{height:230,width:400,resizeMode:'contain'}} source={require('./images/l_bg1_bottom.png')}>
     <View>
     <Text style={{marginTop:70,color:'white',marginLeft:170,fontWeight:'bold'}}>{item.value} DegC</Text>
     <Text style={{marginTop:20,color:'white',marginLeft:110}}>Range  :  {item.range}</Text>
        <View style={{flexDirection:'row',marginTop:15,marginLeft:100}}> 
        <Text style={{marginTop:5,color:'white',fontSize:10}}>Low : </Text>
        <Text style={{marginLeft:15,color:'white',fontSize:20}}>{item.low}</Text>
        <View style={{marginLeft:35,borderRightWidth:1,borderColor:'white'}}></View>
        <Text style={{marginTop:5,marginLeft:30,color:'white',fontSize:10}}>High : </Text>
        <Text style={{marginLeft:15,color:'white',fontSize:20}}>{item.high}</Text>
        </View>
     </View>
    </Image>
</Image>
  ); 
  } else {
    return (
<Image style={{margin:10,marginTop:50,height:300,width:300,resizeMode:'contain'}} source={require('./images/l_bg4.png')}>
 <View style={{marginTop:75,marginLeft:130}}>
  <Text style={{fontSize:12,fontWeight:'bold'}}>Category: {item.category}</Text>
 </View>
 <Text style={{marginTop:15,marginLeft:15,fontSize:15,fontWeight:'bold'}}>{item.name}</Text>
 <View style={{marginTop:20,flexDirection:'row'}}>
    <Image style={{marginTop:5,marginLeft:15,height:15,width:15,resizeMode:'contain'}} source={require('./images/calender.png')}></Image>
    <Text style={{marginTop:5,marginLeft:15,fontSize:14,color:'white'}}>{moment(item.date).format('ddd,MMM Do YYYY')}</Text>
 </View>
 <View style={{marginTop:10,marginLeft:10}}><Progress.Bar progress={0.75} unfilledColor="#2c2e30" borderColor="#262728" color="darkorange" width={250} /></View>
 <View style={{width:300,marginTop:10,flexDirection:'row',justifyContent:'space-between'}}>
  <Text style={{marginLeft:10,fontSize:10,color:'white'}}>Low  :  {item.low}</Text>
  <Text style={{fontSize:10,color:'white'}}>High  :  {item.high}</Text>
 </View>
 <View style={{marginLeft:50,flexDirection:'row'}}>
   <Text style={{marginTop:30,fontSize:10,color:'white'}}>Result     : </Text>
   <Text style={{marginLeft:20,marginTop:25,fontWeight:'bold',color:'white'}}>{item.value} cm </Text>
  </View>
</Image>
 );
  }
    
    break;
      case "Laboratory":
     //with progress bar 
//     return (
// <Image style={{margin:10,marginTop:50,height:300,width:300,resizeMode:'contain'}} source={require('./images/l_bg4.png')}>
//  <View style={{marginTop:75,marginLeft:130}}>
//   <Text style={{fontSize:12,fontWeight:'bold'}}>Category: {item.category}</Text>
//  </View>
//  <Text style={{marginTop:15,marginLeft:15,fontSize:15,fontWeight:'bold'}}>{item.name}</Text>
//  <View style={{marginTop:20,flexDirection:'row'}}>
//     <Image style={{marginTop:5,marginLeft:15,height:15,width:15,resizeMode:'contain'}} source={require('./images/calender.png')}></Image>
//     <Text style={{marginTop:5,marginLeft:15,fontSize:14,color:'white'}}>{moment(item.date).format('ddd,MMM Do YYYY')}</Text>
//  </View>
//  <View style={{marginTop:10,marginLeft:10}}><Progress.Bar progress={0.75} unfilledColor="#2c2e30" borderColor="#262728" color="darkorange" width={250} /></View>
//  <View style={{width:300,marginTop:10,flexDirection:'row',justifyContent:'space-between'}}>
//   <Text style={{marginLeft:10,fontSize:10,color:'white'}}>Low  :  {item.low}</Text>
//   <Text style={{fontSize:10,color:'white'}}>High  :  {item.high}</Text>
//  </View>
//  <View style={{marginLeft:50,flexDirection:'row'}}>
//    <Text style={{marginTop:30,fontSize:10,color:'white'}}>Result     : </Text>
//    <Text style={{marginLeft:20,marginTop:25,fontWeight:'bold',color:'white'}}>{item.value} cm </Text>
//   </View>
// </Image>
//  );
return (
<Image style={{margin:10,height:290,width:300,resizeMode:'contain'}} source={require('./images/l_bg1_top.png')}>
<View style={{marginTop:100,marginLeft:170}}><Text style={{fontSize:11,fontWeight:'bold'}}>Category: {item.category}</Text></View>
<View style={{marginTop:10,marginLeft:60}}><Text style={{color:'white',fontSize:11}}>{item.name}</Text></View>
    <Image style={{height:180,width:300,resizeMode:'contain'}} source={require('./images/l_bg1_bottom.png')}>
     <View>
     <Text style={{marginTop:70,color:'white',marginLeft:140,fontWeight:'bold'}}>{item.value} </Text>
     <Text style={{marginTop:20,color:'white',marginLeft:40}}>Range  :  {item.range}</Text>
        <View style={{flexDirection:'row',marginTop:15,marginLeft:50}}> 
        <Text style={{marginTop:5,color:'white',fontSize:10}}>Low : </Text>
        <Text style={{marginLeft:15,color:'white',fontSize:12}}>{item.low}</Text>
        <View style={{marginLeft:35,borderRightWidth:1,borderColor:'white'}}></View>
        <Text style={{marginTop:5,marginLeft:30,color:'white',fontSize:10}}>High : </Text>
        <Text style={{marginLeft:15,color:'white',fontSize:12}}>{item.high}</Text>
        </View>
     </View>
    </Image>
</Image>
  ); 
  break;
      default:
  return (
  <View style={{margin:10,height:300,width:300,borderRightWidth:1,borderColor:'white'}}>
  <View style={{flexDirection:'row'}}>
<Image style={{height:300,width:130,resizeMode:'contain'}} source={require('./images/l_bg2_.png')}>
  <View style={{borderColor:'transparent',borderLeftWidth:50,borderTopLeftRadius:35,height:50,width:180,borderBottomWidth:1,backgroundColor:'#eaecef',marginLeft:115,marginTop:85}}>
      <Text style={{fontSize:10,marginTop:10,color:"black"}}>Category : {item.category}</Text>
   </View>
  <View style={{borderBottomLeftRadius:5,borderBottomRightRadius:5,marginTop:80,height:40,width:300,backgroundColor:'#343538',flexDirection:'row'}}>
  <Image style={{marginTop:5,marginLeft:100,height:20,width:20,resizeMode:'contain'}} source={require('./images/dt.png')}></Image>
    <Text style={{marginTop:5,marginLeft:15,fontSize:14,color:'white'}}>Date  :  {moment(item.date).format('ddd,MMM Do YYYY')}</Text>
 </View>
</Image>
  <View style={{flexDirection:'column'}}>
   <Text style={{fontSize:11,marginTop:140,color:"black"}}>{item.name}</Text>
   <Text style={{fontSize:10,marginTop:10,color:"black"}}>Response :</Text>
   <Text style={{fontSize:15,marginTop:5,color:"black"}}>{item.response}</Text>
  </View> 
 </View>
 
</View>
  );
//  case "c":
//  return (
// <Image style={{margin:10,height:360,width:400,resizeMode:'contain'}} source={require('./images/l_bg4.png')}>
//  <View style={{marginTop:75,marginLeft:200}}>
//   <Text style={{fontSize:12,fontWeight:'bold'}}>Category: Vital Signs</Text>
//  </View>
//  <Text style={{marginTop:25,marginLeft:15,fontSize:15,fontWeight:'bold'}}>Height / Length Measured</Text>
//  <View style={{marginTop:20,flexDirection:'row'}}>
//     <Image style={{marginTop:5,marginLeft:15,height:15,width:15,resizeMode:'contain'}} source={require('./images/calender.png')}></Image>
//     <Text style={{marginTop:5,marginLeft:15,fontSize:14,color:'white'}}>Apr 06, 2019</Text>
//  </View>
//  <View style={{marginTop:10,marginLeft:10}}><Progress.Bar progress={0.75} unfilledColor="#2c2e30" borderColor="#262728" color="darkorange" width={300} /></View>
//  <View style={{width:300,marginTop:10,flexDirection:'row',justifyContent:'space-between'}}>
//   <Text style={{marginLeft:10,fontSize:10,color:'white'}}>Low  :  120</Text>
//   <Text style={{fontSize:10,color:'white'}}>High  :  200</Text>
//  </View>
//  <View style={{marginLeft:50,flexDirection:'row'}}>
//    <Text style={{marginTop:30,fontSize:10,color:'white'}}>Result     : </Text>
//    <Text style={{marginLeft:20,marginTop:25,fontWeight:'bold',color:'white'}}>175 cm </Text>
//   </View>
// </Image>
//  );
}
  }}
/>
 );
          }
          else if (template.payload.template_type === 'card-Medication'){
            const cardarray=template.payload.elements;
 console.log(cardarray);
            return(
              <View style={{marginBottom:40}}>
              <FlatList horizontal
  data={cardarray}
  renderItem={({item}) => 
<Image style={{margin:10,height:300,width:300,resizeMode:'contain'}} source={require('./images/m_bg1.png')}>
<View style={{marginTop:120,marginLeft:120,flexDirection:'column'}}>
  <Text style={{fontSize:12,color:'white',fontWeight:'bold'}}>{item.name}</Text>
</View>
<View style={{borderRightWidth:1,borderLeftWidth:1,borderColor:'white'}}>
<View style={{marginTop:50,marginLeft:120,flexDirection:'column'}}>
  <Text style={{fontSize:10,color:'gray'}}>Dosage Instructions:</Text>
  <Text style={{fontSize:12,color:'black',fontWeight:'bold'}}>{item.dosage}</Text>
</View>
 <View style={{flexDirection:'row',marginTop:40}}>
      <View style={{backgroundColor:'darkorange',flexDirection:'row',height:50,width:175}}>
     <Text style={{marginLeft:25,marginTop:10,color:'white',fontSize:13}}>Status :</Text>
       <Text style={{marginLeft:25,marginTop:10,color:'white',fontSize:13}}>{item.status}</Text>
       </View>
       <View style={{flexDirection:'row',height:50,width:175,backgroundColor:'#3c3f44'}}> 
         <Text style={{marginLeft:25,marginTop:10,color:'white',fontSize:13}}>Taken : </Text>
         <Text style={{marginLeft:5,marginTop:10,color:'white',fontSize:13}}>{item.taken ==false ?"Yes":"No"}</Text>
       </View>
      </View>
     </View> 
</Image>
}
/>
</View>
            );
          }
          else if (template.payload.template_type === 'card-Problem'){

//   return (
// <FlatList horizontal
// showsHorizontalScrollIndicator={false}
// pagingEnabled={true}
//   data={cardarray}
//   renderItem={({item}) => 
//  <View style={{height:300,width:300,margin:10,borderRadius:10,borderWidth:2,borderColor:'white',backgroundColor:'darkorange'}}>
//    <View style={{flexDirection:'row',borderBottomColor:'white',borderBottomWidth:1}}>
//       <View style={{flexDirection:'column'}}><Text style={{fontWeight: 'bold',fontSize:15,color:'white'}}>Condition</Text>
//       <Text style={{fontSize:15,color:'white'}}>{item.name}</Text>
//       </View>
//    </View>
//    <View style={{marginTop:10,alignItems:'center',justifyContent:'center'}}><Image style={{height:100,width:100,resizeMode:'contain'}}source={{uri:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT3DMQJQsrdcEpC3_Mm4F51M89P2PjB9ZL_ILcDdKexzBoJWNt9bw"}}></Image></View>
//    <View style={{backgroundColor:'white',margin:15}}>
//      <Text style={{fontWeight: 'bold',margin:5}}>Recorded Date: {item.date}</Text>
//      <Text style={{fontWeight: 'bold',margin:5}}>Verification Status:{item.verificationstatus}</Text>
//      <Text style={{fontWeight: 'bold',margin:5}}>Clinical Status: {item.clinicalstatus}</Text>
//      <Text style={{fontWeight: 'bold',margin:5}}>onsetDateTime: {item.onsetdatetime}</Text>
//    </View>
//  </View>
// }
// />
//     );
const cardarray=template.payload.elements;
 console.log(cardarray);
 return (
  
      <FlatList horizontal  
  data={cardarray}
  renderItem={({item}) => 
    <Image style={{
    flex: 1,
    height: 300,
    width: 300,
    resizeMode: 'contain'
  }} source={require('./images/p_bg2.png')}>
 <View style={{marginTop:70,marginLeft:140,flexDirection:'column'}}>
    <Text style={{fontSize:11}}>Condition</Text>
    <Text style={{fontSize:11,fontWeight:'bold'}}>{item.name}</Text>
  </View>
       <View style={{flexDirection:'row'}}>
   <View style={{marginTop:30,marginLeft:50,flexDirection:'column'}}>
    <Text style={{color:'white',fontSize:10}}>Recorded Date</Text>
    <Text style={{color:'white',fontSize:15}}>{item.date!=null ? item.date : null }</Text>
   </View>
   <View style={{marginTop:30,marginLeft:50,flexDirection:'column'}}>
    <Text style={{color:'white',fontSize:10}}>OnSet Date & Time </Text>
    <Text style={{color:'white',fontSize:15}}>{item.onsetdatetime!=null ? item.onsetdatetime : null}</Text>
   </View>
   </View>
    <View style={{marginLeft:60}}> 
      <View style={{flexDirection:'row',margin:5}} >
         <Text style={{fontSize:12}}>Verification Status</Text>
         <Text style={{marginLeft:20}}>:</Text>
          <Text style={{marginLeft:20,fontSize:12,fontWeight:'bold'}}>{item.verificationstatus}</Text>
      </View>
      <View style={{borderBottomWidth:1,borderColor:'gray',marginRight:40}}></View>
      <View style={{flexDirection:'row',margin:5}} >
         <Text style={{fontSize:12}}>Clinical Status</Text>
         <Text style={{marginLeft:50}}>:</Text>
          <Text style={{marginLeft:20,fontSize:12,fontWeight:'bold'}}>{item.clinicalstatus}</Text>
      </View>
   
     </View>
      </Image>

   
}
/>
    );
          } 
          else if(template.payload.template_type === 'card-Allergy'){
            
//    return (
// <FlatList horizontal
// showsHorizontalScrollIndicator={false}
// pagingEnabled={true}
//   data={cardarray}
//   renderItem={({item}) => 
//  <View style={{height:200,width:300,margin:10,borderRadius:10,borderWidth:2,borderColor:'white',backgroundColor:'dodgerblue'}}>
//  {/*<View style={{marginTop:10,alignItems:'center',justifyContent:'center'}}><Image style={{height:100,width:100,resizeMode:'contain'}}source={{uri:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQSUgQxUiW-0kGiCXz4mhu7Js2hbrLIePo0Gh0GB_4JzFO8qSG-"}}></Image></View>*/}
  
//        <View style={{flexDirection:'row',margin:10,borderWidth:2,borderRadius:10,borderColor:'white'}}> 
//        <Image style={{height:50,width:50,resizeMode:'contain'}}source={{uri:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRSQ8q2JzZz5KeSJagAbRyOTQD82L6ql3Mxfg8cXn4gg7Vb9lS8"}}></Image>
//        <Text style={{marginLeft:10,fontSize:20,color:'white'}}>{item.name}</Text>
//        </View>
  
//  { /* <View style={{marginTop:10,alignItems:'center',justifyContent:'center'}}><Image style={{height:100,width:100,resizeMode:'contain'}}source={{uri:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT3DMQJQsrdcEpC3_Mm4F51M89P2PjB9ZL_ILcDdKexzBoJWNt9bw"}}></Image></View>*/}
//    <View style={{backgroundColor:'white'}}>
//      <Text style={{marginLeft:15,color:'dodgerblue',fontWeight: 'bold',margin:5}}>Date: {item.date}</Text>
//     <View style={{flexDirection:'row',marginHorizontal:15}}> 
//        <Text style={{color:'dodgerblue',fontWeight: 'bold',margin:5}}>Status: {item.status}</Text>
//        <Text style={{marginLeft:30,color:'dodgerblue',fontWeight: 'bold',margin:5}}>Severity: {item.severity}</Text>
//      </View>
//     <View style={{flexDirection:'row',marginHorizontal:15}}> 
//       <Text style={{color:'dodgerblue',fontWeight: 'bold',margin:5}}>Reaction: {item.reaction}</Text>
//       <Text style={{marginLeft:30,color:'dodgerblue',fontWeight: 'bold',margin:5}}>Category: {item.category}</Text>
//     </View>
//    </View>
//  </View>
// }
// />
//     );
const cardarray=template.payload.elements;
 console.log(cardarray);
     return (
  
      <FlatList horizontal
      pagingEnabled={false}
  data={cardarray}
  renderItem={({item}) => 
 
    <Image style={{
    flex: 1,
    height: 300,
    width: 300,
    resizeMode: 'contain'
  }} source={require('./images/al_bg1.png')}>
       <View style={{flexDirection:'row'}}>
   <Text style={{marginTop:150,marginLeft:10,color:'white',fontSize:11}}>{moment(item.date).format('MMM Do YYYY')}</Text>
   <View style={{marginTop:60,marginLeft:30,flexDirection:'column'}}>
    <Text style={{marginTop:10,color:'white',marginLeft:20,fontSize:13}}>{item.name}</Text>
    <Text style={{color:'white',fontSize:15,marginLeft:50,marginTop:25}}>{item.status}</Text>
   </View>
   </View>
    <View style={{marginLeft:150}}> 
      <View style={{flexDirection:'row'}} >
         <Text>Severity</Text>
         <Text style={{marginLeft:10}}>:</Text>
          <Text style={{marginLeft:10,fontWeight:'bold'}}>{item.severity}</Text>
      </View>
      <View style={{flexDirection:'row'}} >
         <Text>Reaction</Text>
         <Text style={{marginLeft:5}}>:</Text>
          <Text style={{marginLeft:10,fontWeight:'bold'}}>{item.reaction}</Text>
      </View>
     <View style={{flexDirection:'row'}} >
         <Text>Category</Text>
         <Text style={{marginLeft:5}}>:</Text>
          <Text style={{marginLeft:10,fontWeight:'bold'}}>{item.category}</Text>
      </View>
     </View>
      </Image>
   
}
/>
    );
          }
        }
      } 
  //         else if(originalObj.url){
         
  //    return (
  //      //oldmenu
  // //   (<View style={{marginTop:100,alignItems:'center',justifyContent:'center'}}>
  // //      <FlatList
  // //   data={dataS}
  // // numColumns={3}
  // // renderItem={({item}) => 
  // // <View style={{height:180,width:120,borderColor:'darkorange',backgroundColor:'dodgerblue',borderWidth:5}}>
  // // <TouchableOpacity onPress={()=>this.handleMenuPress(item.name)}>
  // //   <Image style={{borderRadius:50,margin:30,width:50,height:50,resizeMode:'contain'}} source={{uri:item.url}}></Image>
  // //   <View style={{alignItems:'center',justifyContent:'center'}}><Text style={{fontSize:15,color:'white'}}>{item.name}</Text></View>
  // //   </TouchableOpacity>
  // // </View>}

  // //   />
    
  // // </View>)
  // <View style={{marginRight:60,marginBottom:40}}>
  // <FlatList
  //   data={dataS}
  // numColumns={2}
  // renderItem={({item}) => 
  // <View style={{borderColor:'transparent',backgroundColor:"transparent",borderWidth:5}}>
  // <TouchableOpacity onPress={()=>this.handleMenuPress(item.name)}>
  // <View style={{height:95,width:100,borderColor:'gray',borderWidth:1,borderRadius:5}}>

  //   <View style={{flexDirection:'row'}}>
  //     <Image style={{borderRadius:10,margin:5,marginLeft:35,width:50,height:50,resizeMode:'contain'}} source={item.url}></Image>
  //      <View style={{ margin:10,height:25,width:25,backgroundColor:'red',borderRadius:25 }}>
  //       <Text style={{fontSize:10,marginTop:5,textAlign:'center',color:'white'}}>11</Text>
  //     </View>
  //   </View>
  //   <View style={{marginTop:10,alignItems:'center',justifyContent:'center'}}><Text style={{fontWeight:'bold',fontSize:15,color:'gray'}}>{item.name}</Text></View>
  //   </View>
  //   </TouchableOpacity>
  // </View>}

  //   />
  //   </View>
  //   );
  
    
  //     }
    }

    return null;
  }

  renderVideos() {
    // const text = this.props.currentMessage.text;
    const { original } = this.props.currentMessage;
    let originalObj = null;
    try {
      originalObj = JSON.parse(original);
    } catch (error) {
      return null;
    }
    if (originalObj.attachment) {
      // show attachments from the message
      if (originalObj.attachment.type === 'template') {
        const template = originalObj.attachment;
        if (template.video_links && template.video_links !== '') {
          const links = template.video_links.split(',');
          return (
            <ScrollView
              directionalLockEnabled={false}
              horizontal={true}
              showsHorizontalScrollIndicator={false}
              style={{ flexDirection: 'row' }}
            >
              {
                links.map((link, i) => {
                  return (
                    <View
                      key={i}
                      style={{
                        flex: 1,
                        minHeight: 180,
                        minWidth: 250,
                        marginRight: 15,
                        marginTop: 15,
                        marginBottom: 15,
                      }}
                    >
                      <WebView
                        style={{ flex: 1 }}
                        ref={(ref) => { this.videoPlayer = ref; }}
                        scalesPageToFit={true}
                        source={{ html: `<html><meta content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0" name="viewport" /><iframe src="https://www.youtube.com/embed/${link.split('/').slice(-1)}?modestbranding=1&playsinline=1&showinfo=1&rel=0&autoplay=0&controls=1&cc_load_policy=1" frameborder="0" style="overflow:hidden;overflow-x:hidden;overflow-y:hidden;position:absolute;top:0px;left:0px;right:0px;bottom:0px;border-radius:10px 10px 10px 10px;" height="100%" width="100%"></iframe></html>` }}
                        onShouldStartLoadWithRequest={this.onShouldStartLoadWithRequest} // for iOS
                        onNavigationStateChange={this.onShouldStartLoadWithRequest} // for Android
                      />
                    </View>
                  );
                })
              }
            </ScrollView>
          );
        }
      }
    }
    return null;
  }

  renderYoutubeVideo() {
    
    if (this.props.currentMessage.text.startsWith('https://youtu')) {
      return (
        <View style={{ flex: 1, minHeight: 180, minWidth: 250, borderTopLeftRadius: 10, borderTopRightRadius: 10 }}>
          <WebView
            style={{ flex: 1 }}
            ref={(ref) => { this.videoPlayer = ref; }}
            scalesPageToFit={true}
            source={{ html: `<html><meta content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0" name="viewport" /><iframe src="https://www.youtube.com/embed/${this.props.currentMessage.text.split('/').slice(-1)}?modestbranding=1&playsinline=1&showinfo=1&rel=0&autoplay=0&controls=1&cc_load_policy=1" frameborder="0" style="overflow:hidden;overflow-x:hidden;overflow-y:hidden;position:absolute;top:0px;left:0px;right:0px;bottom:0px;border-radius:10px 10px 0px 0px;" height="100%" width="100%"></iframe></html>` }}
            onShouldStartLoadWithRequest={this.onShouldStartLoadWithRequest} // for iOS
            onNavigationStateChange={this.onShouldStartLoadWithRequest} // for Android
          />
        </View>
      );
    }
  }
 _onNavigationStateChange(webViewState){
           console.log(webViewState);
            //setInterval(()=>{this.setState({url:webViewState.url})},5000)
         }
renderUrl(url,title){
    console.log(url+title);
  
    return (
      <View>
        <Modal
          animationType="slide"
          transparent={false}
          visible={this.state.modalVisible}
          onRequestClose={() => {
            Alert.alert('Modal has been closed.');
          }}>
        
              <View style={{height:600,width:'100%'}}>
        <WebView
          source={{uri:`${url}`}}
          style={{marginTop: 40,height:600,width:'100%'}}
          onNavigationStateChange={this._onNavigationStateChange.bind(this)}
             javaScriptEnabled={true}
    domStorageEnabled={true}
    startInLoadingState={true}
       />
       </View>

              <TouchableHighlight
                onPress={() => {
                  this.setModalVisible(!this.state.modalVisible);
                }}>
               <View style={{marginBottom:10,width:250,marginLeft:100,borderWidth:2,borderRadius:10,borderColor:'darkorange'}}>
                 {/*<Image style={{marginLeft:100,height:50,width:50,resizeMode:'contain'}}source={{uri:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTW_4AR72BRx4aywsrUrFG7k45JVW5m3ICd1LzHJ89IHxJoqn1-"}}></Image>*/}
                 <Text style={{marginLeft:80,fontSize:15,color:'darkorange'}}>close</Text>
                </View>
              </TouchableHighlight>
        </Modal>

        <TouchableOpacity
         style={styles.customButton}
          onPress={() => {
            this.setModalVisible(true);
          }}>
          <Text style={{color:'white'}}>{title}</Text>
        </TouchableOpacity>
      </View>
    );

//  if(this.state.check){
//      return(
//       <View style={{flex:1}}>
//        <WebView
//           source={{uri: `${url}`}}
//           style={{marginTop: 20,flex:1}}
//           onNavigationStateChange={this._onNavigationStateChange.bind(this)}
//              javaScriptEnabled={true}
//     domStorageEnabled={true}
//     startInLoadingState={false}
//        />
//        </View>
//      );
//    } else {
//       return(
//         <TouchableOpacity 
//         style={styles.customButton}
//           onPress={()=>this.setState({check: true})}>
//            <Text style={{color:'white'}}>{title}</Text>
//         </TouchableOpacity>
//      );
//    }    
     
  
}
  renderUrlTemplates() {
    const { original } = this.props.currentMessage;
    let originalObj = null;
    try {
      originalObj = JSON.parse(original);
    } catch (error) {
      return null;
    }
    if (originalObj.attachment) {
      // show url card layout from the message
      if (originalObj.attachment.type === 'template') {
        const template = originalObj.attachment;
        if (template.payload.template_type === 'generic' && template.payload.elements.length > 0) {
          const elements = template.payload.elements;
          return (
            <ScrollView
              directionalLockEnabled={true}
              horizontal={true}
              showsHorizontalScrollIndicator={true}
              style={{ flex: 1, flexDirection: 'row', minWidth: 250, paddingTop: 70 }}
            >
              {
                elements.map((element, i) => {
                  return (
                    <View
                      key={i}
                      style={{
                        flex: 1,
                        padding: 10,
                      }}
                    >
                      <View>
                        <TouchableOpacity onPress={() =>{}}>
                          <View style={{ borderBottomWidth: 1, borderColor: '#FFF', paddingBottom: 70 }}>
                            <Image
                              style={{ height: 200,width:200 }}
                              source={{ uri: element.image_url }}
                              resizeMode={'contain'}
                            />
                          </View>
                        </TouchableOpacity>
                        <View style={{ flex: 1, marginTop: 15 }}>
                          <Text
                            style={{ marginBottom: 5, fontWeight: '700', alignSelf: 'center' }}
                          >
                            {this.urlDescSplit(element.subtitle)}
                          </Text>
                          <Text
                            style={{ alignSelf: 'center', fontWeight: '300' }}
                          >
                            {
                              element.default_action.url.length <= 30 ?
                              element.default_action.url :
                              `${element.default_action.url.slice(0, 25)}...`
                            }
                          </Text>
                          <View style={{ flexDirection: 'row', alignSelf: 'center', marginTop: 15 }}>
                            {
                              element.buttons.map((button, i) => {
                                if (button.type === 'web_url') {
                                  return (
                                   this.renderUrl(button.url,button.title)
                                  );
            
                                  //   return (
                                  //   <TouchableOpacity
                                  //     key={i}
                                  //     onPress={() => {this.renderUrl(button.url,button.title)}}
                                  //     style={styles.customButton}
                                  //   >
                                  //     <Text style={{ color: '#FFF' }}>{button.title}</Text>
                                  //   </TouchableOpacity>
                                  // );
                                } else if (button.type === 'postback') {
                                  return (
                                    <TouchableOpacity
                                      key={i}
                                      onPress={() => {}}
                                      style={styles.customButton}
                                    >
                                      <Text style={{ color: '#FFF' }}>{button.title}</Text>
                                    </TouchableOpacity>
                                  );
                                }
                              })
                            }
                          </View>
                        </View>
                      </View>
                    </View>
                  );
                })
              }
            </ScrollView>
          );
        }
      }
    } else if(originalObj.menu){
      const Menu = originalObj.menu;
      console.log(Menu)
         const menuarr=[
{url:immunization,name:'Immunizations',total:Menu.immunizations}, 
{url:medication,name:'Medications',total:Menu.medications},
{url:allergy,name:'Allergies',total:Menu.allergies},
 {url:result,name:'Lab Results',total:Menu.results},
{url:appointment,name:'Appointments',total:Menu.appointments},
{url:condition,name:'Problems',total:Menu.conditions},
       ]
    
     return (
       //oldmenu
  //   (<View style={{marginTop:100,alignItems:'center',justifyContent:'center'}}>
  //      <FlatList
  //   data={dataS}
  // numColumns={3}
  // renderItem={({item}) => 
  // <View style={{height:180,width:120,borderColor:'darkorange',backgroundColor:'dodgerblue',borderWidth:5}}>
  // <TouchableOpacity onPress={()=>this.handleMenuPress(item.name)}>
  //   <Image style={{borderRadius:50,margin:30,width:50,height:50,resizeMode:'contain'}} source={{uri:item.url}}></Image>
  //   <View style={{alignItems:'center',justifyContent:'center'}}><Text style={{fontSize:15,color:'white'}}>{item.name}</Text></View>
  //   </TouchableOpacity>
  // </View>}

  //   />
    
  // </View>)
  <View style={{width:Width,marginTop:30,marginRight:80}}>
  <FlatList
    data={menuarr}
  numColumns={2}
  renderItem={({item}) => 
 
  
   
     <View style={{borderColor:'transparent',backgroundColor:"transparent",borderWidth:5}}>
  <TouchableOpacity onPress={()=>this.handleMenuPress(item.name)}>
  <View style={{height:95,width:140,borderColor:'gray',borderWidth:1,borderRadius:5}}>

    <View style={{flexDirection:'row'}}>
      <Image style={{borderRadius:10,margin:5,marginLeft:35,width:50,height:50,resizeMode:'contain'}} source={item.url}></Image>
       <View style={{ margin:10,height:25,width:25,backgroundColor:'red',borderRadius:25 }}>
        <Text style={{fontSize:10,marginTop:5,textAlign:'center',color:'white'}}>{item.total}</Text>
      </View>
    </View>
    <View style={{marginTop:10,alignItems:'center',justifyContent:'center'}}><Text style={{fontWeight:'bold',fontSize:15,color:'gray'}}>{item.name}</Text></View>
    </View>
    </TouchableOpacity>
  </View>
   }
 
   
 


    />
    </View>
    );
  
    
      }
  }

  render() {
  
    return (
      <View
        style={[
          styles[this.props.position].container,
          this.props.containerStyle[this.props.position],
        ]}
      >
        <View
          style={[
            styles[this.props.position].wrapper,
            this.props.wrapperStyle[this.props.position],
            this.handleBubbleToNext(),
            this.handleBubbleToPrevious()
          ]}
        >
          {this.renderYoutubeVideo()}
          {this.renderUrlTemplates()}
          <TouchableWithoutFeedback
            onLongPress={this.onLongPress}
            accessibilityTraits="text"
            onPress={this.toggleModalActions}
            {...this.props.touchableProps}
          >
            <View>
              {this.renderCustomView()}
              {this.renderReply()}
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                }}
              >
                {
              ((this.props.currentMessage.image || this.props.currentMessage.video)
               &&
               <View>
                 {this.props.position === 'left' ? this.renderUsername() : null}
                 {this.renderMessageImage()}
               </View>)
              ||
              <View>
                {this.props.position === 'left' ? this.renderUsername() : null}
                {this.state.check==false ? this.renderload() : this.renderMessageText()}
              </View>
            }
              </View>
              {
                !this.props.currentMessage.suggestion &&
                  <View style={[styles.bottom, this.props.bottomContainerStyle[this.props.position]]}>
                    {this.renderActionsModal()}
                    {this.renderActions()}
                    <View>
                      {this.renderTime()}
                      {this.renderTicks()}
                    </View>
                  </View>
              }
            </View>
          </TouchableWithoutFeedback>
        </View>
        <View  style={{flex:1}}>
          {this.renderVideos()}
          {this.renderSuggestions()}
        </View>
      </View>
    );
  }

}

const chatColors = {
  replyBubbleR: AppColors.chat().replyBubbleR,
};


const styles = {
  left: StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'flex-start',
    },
    replyContainer: {
      backgroundColor: AppColors.chat().replyBubbleL,
    },
    replyText: {
      fontSize: 12,
      color: AppColors.chat().replyTextL,
    },
    wrapper: {
      borderRadius: 15,
      backgroundColor: Color.leftBubbleBackground,
      marginRight: 60,
      minHeight: 20,
      justifyContent: 'flex-end',
    },
    containerToNext: {
      borderBottomLeftRadius: 3,
    },
    containerToPrevious: {
      borderTopLeftRadius: 3,
    },
    standardFont: {
      fontSize: 15,
    },
    username: {
      fontWeight: 'bold',
      color: AppColors.brand().primary,
    },
    headerItem: {
      marginLeft: 10,
    },
  }),
  right: StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'flex-end',
    },
    replyContainer: {
      backgroundColor: chatColors.replyBubbleR,
    },
    replyText: {
      fontSize: 12,
      color: AppColors.chat().replyTextR,
    },
    wrapper: {
      borderRadius: 15,
      backgroundColor: Color.defaultBlue,
      marginLeft: 60,
      minHeight: 20,
      justifyContent: 'flex-end',
    },
    containerToNext: {
      borderBottomRightRadius: 3,
    },
    containerToPrevious: {
      borderTopRightRadius: 3,
    },
  }),
  bottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  tick: {
    fontSize: 10,
    backgroundColor: Color.backgroundTransparent,
    color: Color.white,
  },
  tickView: {
    flexDirection: 'row',
    marginRight: 10,
  },
  actionBtn: {
    // padding: 5,
    // borderColor: 'red',
    // borderWidth: 1,
    // borderRadius: 3,
    // borderColor: '#fff',
    // flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
    width: '100%',
    // borderTopColor: 'rgba(0,0,0,0.5)',
    // borderTopWidth: 1,
    // borderWidth:1,
  },
  replyWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: 8,
    margin: 5,
    borderRadius: 3,
    borderColor: AppColors.brand().bubble_replyWrapperBorderColor,
    borderWidth: 1,
  },
  standardFont: {
    fontSize: 15,
  },
  username: {
    fontWeight: 'bold',
    color: AppColors.brand().primary,
  },
  headerItem: {
    marginLeft: 5,
  },
  customButton: {
    height: 30,
    padding: 10,
    borderRadius: 20,
    backgroundColor: '#15BBE5', // #2B3D60
    justifyContent: 'center',
    alignItems: 'center',
    margin: 1,
  },
  iconContainer: {
    // backgroundColor: '#898989',
    // borderRadius: 30,
    // padding: 10,
    // borderColor: '#00FFDD',
  },
};

Bubble.contextTypes = {
  actionSheet: PropTypes.func,
};

Bubble.defaultProps = {
  touchableProps: {},
  renderUsername: null,
  onLongPress: null,
  renderMessageImage: null,
  renderMessageText: null,
  renderCustomView: null,
  renderTicks: null,
  renderTime: null,
  position: 'left',
  currentMessage: {
    text: null,
    createdAt: null,
    image: null,
  },
  nextMessage: {},
  previousMessage: {},
  containerStyle: {},
  replyStyle: {},
  wrapperStyle: {},
  bottomContainerStyle: {},
  usernameStyle: {},
  tickStyle: {},
  containerToNextStyle: {},
  containerToPreviousStyle: {},
  // TODO: remove in next major release
  isSameDay: warnDeprecated(isSameDay),
  isSameUser: warnDeprecated(isSameUser),
  obj: {},
  user: {},
  msgCopy: null,
};

Bubble.propTypes = {
  touchableProps: PropTypes.object,  // eslint-disable-line react/forbid-prop-types
  renderUsername: PropTypes.func,
  onLongPress: PropTypes.func,
  renderMessageImage: PropTypes.func,
  renderMessageText: PropTypes.func,
  renderCustomView: PropTypes.func,
  renderTime: PropTypes.func,
  renderTicks: PropTypes.func,
  position: PropTypes.oneOf(['left', 'right']),
  currentMessage: PropTypes.object,  // eslint-disable-line react/forbid-prop-types
  nextMessage: PropTypes.object,  // eslint-disable-line react/forbid-prop-types
  previousMessage: PropTypes.object,  // eslint-disable-line react/forbid-prop-types
  containerStyle: PropTypes.shape({
    left: ViewPropTypes.style,
    right: ViewPropTypes.style,
  }),
  replyStyle: React.PropTypes.object, // eslint-disable-line react/forbid-prop-types
  wrapperStyle: PropTypes.shape({
    left: ViewPropTypes.style,
    right: ViewPropTypes.style,
  }),
  bottomContainerStyle: PropTypes.shape({
    left: ViewPropTypes.style,
    right: ViewPropTypes.style,
  }),
  usernameStyle: Text.propTypes.style,
  tickStyle: Text.propTypes.style,
  containerToNextStyle: PropTypes.shape({
    left: ViewPropTypes.style,
    right: ViewPropTypes.style,
  }),
  containerToPreviousStyle: PropTypes.shape({
    left: ViewPropTypes.style,
    right: ViewPropTypes.style,
  }),
  // TODO: remove in next major release
  isSameDay: PropTypes.func,
  isSameUser: PropTypes.func,
  obj: React.PropTypes.object,    // eslint-disable-line react/forbid-prop-types
  user: React.PropTypes.object,    // eslint-disable-line react/forbid-prop-types
  msgCopy: PropTypes.func,
};

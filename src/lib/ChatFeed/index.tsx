// Copyright 2017 Brandon Mowat
// Written, developed, and designed by Brandon Mowat for the purpose of helping
// other developers make chat interfaces.

import * as React from 'react';
import BubbleGroup from '../BubbleGroup';
import DefaultChatBubble, { ChatBubbleProps } from '../ChatBubble';
import Message from '../Message';
import styles from './styles';
import { Author } from '../Author';
import { ChatBubbleStyles } from '../ChatBubble/';
import Avatar, { AvatarProps } from '../Avatar';
import IsTyping from '../IsTyping';
import ChatScrollArea, { ChatScrollAreaProps, IChatScrollArea } from '../ChatScrollArea';
import LastSeenAvatar, { LastSeenAvatarProps } from '../LastSeenAvatar';

// Model for ChatFeed props.

export interface ChatFeedProps {
  className?: string;
  authors: Author[];
  yourAuthorId: number;
  bubblesCentered?: boolean;
  bubbleStyles?: ChatBubbleStyles;
  maxHeight?: string | number;
  minHeight?: string | number;
  messages: Message[];
  showRecipientAvatar?: boolean;
  showRecipientAvatarChatMessagesStyle?: React.CSSProperties;
  showRecipientLastSeenMessage?: boolean;
  showRecipientLastSeenMessageChatMessagesStyle?: React.CSSProperties;
  showIsTyping?: boolean;
  showIsTypingChatMessagesStyle?: React.CSSProperties;
  customChatBubble?: (props: ChatBubbleProps) => JSX.Element;
  customAvatar?: (props: AvatarProps) => JSX.Element;
  customScrollArea?: (props: ChatScrollAreaProps) => JSX.Element;
  customIsTyping?: (props: ChatScrollAreaProps) => JSX.Element;
  customLastSeenAvatar?: (props: LastSeenAvatarProps) => JSX.Element;
  onMessageSendRef?: (onMessageSend: () => void) => void;
}

// React component to render a complete chat feed
export default class ChatFeed extends React.Component<ChatFeedProps> {
  public static defaultProps: ChatFeedProps = {
    messages: [],
    authors: [],
    customChatBubble: props => <DefaultChatBubble {...props} />,
    customAvatar: props => <Avatar {...props} />,
    customScrollArea: props => <ChatScrollArea {...props} />,
    customLastSeenAvatar: props => <LastSeenAvatar {...props} />,
    yourAuthorId: 0
  }

  private scrollElementRef: IChatScrollArea;

  constructor(props: ChatFeedProps) {
    super(props);
  }

  componentDidMount() {
    this.props.onMessageSendRef && this.props.onMessageSendRef(() => this.scrollElementRef && this.scrollElementRef.scrollToBottom());
  }

  componentWillUnmount() {
    this.props.onMessageSendRef && this.props.onMessageSendRef(undefined);
  }

  /**
   * Determines what type of message/messages to render.
   */
  renderMessages(messages: Message[]) {
    const { bubbleStyles, customChatBubble, showRecipientAvatar } = this.props;

    let group = [];

    const messageNodes = messages.map((message, index) => {
      group.push(message);
      // Find diff in message type or no more messages
      if (!messages[index + 1] || messages[index + 1].authorId !== message.authorId) {
        const messageGroup = group;
        const author = this.props.authors && this.props.authors.filter(a => a.id === message.authorId)[0];
        group = [];
        return (
          <BubbleGroup
            key={index}
            yourAuthorId={this.props.yourAuthorId}
            messages={messageGroup}
            author={author}
            authors={this.props.authors}
            showRecipientAvatar={showRecipientAvatar}
            customChatBubble={customChatBubble}
            bubbleStyles={bubbleStyles}
            showRecipientLastSeenMessage={this.props.showRecipientLastSeenMessage}
            customLastSeenAvatar={this.props.customLastSeenAvatar}
          />
        );
      }

      return null;
    });

    return messageNodes;
  }

  renderIsTyping() {
    const typingAuthors = this.props.authors && this.props.authors.filter(a => a.isTyping && a.id !== this.props.yourAuthorId);
    if (!typingAuthors || typingAuthors.length === 0) {
      return null;
    }
    return <IsTyping typingAuthors={typingAuthors} />;
  }

  /**
   * render : renders our chat feed
   */
  render() {
    return (
      <div
        id={'react-chat-ui__chat-panel ' + (this.props.className ? this.props.className : '')}
        style={{
          ...styles.chatPanel
        }}
      >
        <this.props.customScrollArea
          minHeight={this.props.minHeight}
          maxHeight={this.props.maxHeight}
          refScrollElement={e => this.scrollElementRef = e}
        >
          <div
            style={{
              ...styles.chatMessages,
              ...(this.props.showRecipientAvatar && styles.showRecipientAvatarChatMessagesStyle),
              ...(this.props.showRecipientAvatar && this.props.showRecipientAvatarChatMessagesStyle),
              ...(this.props.showIsTyping && styles.showIsTypingChatMessagesStyle),
              ...(this.props.showIsTyping && this.props.showIsTypingChatMessagesStyle),
              ...(this.props.showRecipientLastSeenMessage && styles.showRecipientLastSeenMessageChatMessagesStyle),
              ...(this.props.showRecipientLastSeenMessage && this.props.showRecipientLastSeenMessageChatMessagesStyle),
            }}
            className="react-chat-ui__chat-messages"
          >
            {this.renderMessages(this.props.messages)}
            {this.props.showIsTyping && this.renderIsTyping()}
          </div>
        </this.props.customScrollArea>
      </div>
    );
  }
}
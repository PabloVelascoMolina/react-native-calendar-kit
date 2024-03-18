import isEqual from 'lodash/isEqual';
import React, { memo } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import Animated, {
  SharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import type { PackedEvent, ThemeProperties } from '../../types';
import { shallowEqual } from '../../utils';

export interface EventBlockProps {
  event: PackedEvent;
  dayIndex: number;
  columnWidth: number;
  onPressEvent?: (eventItem: PackedEvent) => void;
  onLongPressEvent?: (eventItem: PackedEvent) => void;
  timeIntervalHeight: SharedValue<number>;
  renderEventContent?: (
    event: PackedEvent,
    timeIntervalHeight: SharedValue<number>
  ) => JSX.Element;
  selectedEventId?: string;
  theme: ThemeProperties;
  eventAnimatedDuration?: number;
  isPinchActive: SharedValue<boolean>;
  heightByTimeInterval: SharedValue<number>;
}

const EVENT_DEFAULT_COLOR = '#FFFFFF';

const EventBlock = ({
  event,
  dayIndex,
  columnWidth,
  onPressEvent,
  onLongPressEvent,
  renderEventContent,
  theme,
  selectedEventId,
  eventAnimatedDuration,
  isPinchActive,
  timeIntervalHeight,
  heightByTimeInterval,
}: EventBlockProps) => {
  const _onLongPress = () => {
    const eventParams = {
      ...event,
      top: event.startHour * heightByTimeInterval.value,
      height: event.duration * heightByTimeInterval.value,
      leftByIndex: columnWidth * dayIndex,
    };
    onLongPressEvent?.(eventParams);
  };

  const _onPress = () => {
    const eventParams = {
      ...event,
      top: event.startHour * heightByTimeInterval.value,
      height: event.duration * heightByTimeInterval.value,
      leftByIndex: columnWidth * dayIndex,
    };
    onPressEvent?.(eventParams);
  };

  const eventStyle = useAnimatedStyle(() => {
    let eventHeight = event.duration * heightByTimeInterval.value;

    if (theme.minimumEventHeight) {
      eventHeight = Math.max(theme.minimumEventHeight, eventHeight);
    }

    if (isPinchActive.value) {
      return {
        top: event.startHour * heightByTimeInterval.value,
        height: eventHeight,
        left: event.left + columnWidth * dayIndex,
        width: event.width,
      };
    }

    return {
      top: withTiming(event.startHour * heightByTimeInterval.value, {
        duration: eventAnimatedDuration,
      }),
      height: withTiming(eventHeight, {
        duration: eventAnimatedDuration,
      }),
      left: withTiming(event.left + columnWidth * dayIndex, {
        duration: eventAnimatedDuration,
      }),
      width: withTiming(event.width, {
        duration: eventAnimatedDuration,
      }),
    };
  }, [event]);

  const _renderEventContent = () => {
    return (
        <View>
            <Text numberOfLines={1} style={styles.eventTitle}>
                {event.title || 'Event'}
            </Text>
        </View>
    );
  };

  const eventOpacity = selectedEventId ? 0.5 : 1;

  return (
    <Animated.View
      style={[
        styles.eventContainer,
        { opacity: eventOpacity },
        event.containerStyle,
        eventStyle,
      ]}
    >
      <TouchableOpacity
        disabled={!!selectedEventId}
        delayLongPress={300}
        onPress={_onPress}
        onLongPress={_onLongPress}
        style={[
            StyleSheet.absoluteFill,
            { 
                backgroundColor: event.color ? event.color : EVENT_DEFAULT_COLOR,
                borderLeftColor: event.borderColor ? event.borderColor : EVENT_DEFAULT_COLOR
            },
        ]}
        activeOpacity={0.6}
      >
        {renderEventContent
          ? renderEventContent(event, timeIntervalHeight)
          : _renderEventContent()}
      </TouchableOpacity>
    </Animated.View>
  );
};

const areEqual = (prev: EventBlockProps, next: EventBlockProps) => {
  const { event: prevEvent, theme: prevTheme, ...prevOther } = prev;
  const { event: nextEvent, theme: nextTheme, ...nextOther } = next;
  const isSameEvent = isEqual(prevEvent, nextEvent);
  const isSameTheme = isEqual(prevTheme, nextTheme);
  const isSameOther = shallowEqual(prevOther, nextOther);
  return isSameEvent && isSameTheme && isSameOther;
};

export default memo(EventBlock, areEqual);

const styles = StyleSheet.create({
    eventContainer: {
        borderRadius: 5,
        borderLeftWidth: 5,
       
        padding: 8,
        paddingLeft: 10,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    eventTitle: {
        fontWeight: 'bold',
        fontSize: 14,
        marginBottom: 2,
    },
    eventSummary: {
        fontSize: 12,
    },
    eventTimes: {
        fontSize: 12,
        marginTop: 4,
    }
});

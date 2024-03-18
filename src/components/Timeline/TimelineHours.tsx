import React, { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  SharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { DEFAULT_PROPS } from '../../constants';
import { useTimelineCalendarContext } from '../../context/TimelineProvider';
import type { ThemeProperties } from '../../types';

export type HourItem = { text: string; hourNumber: number; };

const TimelineHours = () => {
  const { hours, hourWidth, timeIntervalHeight, spaceFromTop, theme } =
    useTimelineCalendarContext();

  const _renderHourAndMinutes = (hour: HourItem, index: number) => {
    // Renderizar la hora
    const hourComponent = (
      <HourLabel
        key={`hour_${index}`}
        label={hour.text}
        index={index}
        timeIntervalHeight={timeIntervalHeight}
        spaceContent={spaceFromTop}
        theme={theme}
        isHour={true}
      />
    );

    // Renderizar los minutos después de la hora
    const minutes = [15, 30, 45];
    const minutesComponents = minutes.map((minute, minuteIndex) => (
      <HourLabel
        key={`minute_${index}_${minuteIndex}`}
        label={`${minute}`}
        index={index + (minute / 60)}
        timeIntervalHeight={timeIntervalHeight}
        spaceContent={spaceFromTop}
        theme={theme}
        isHour={false}
      />
    ));

    return [hourComponent, ...minutesComponents];
  };

  return (
    <View
      style={[
        styles.hours,
        {
          width: hourWidth,
          backgroundColor: theme.backgroundColor,
          marginBottom: spaceFromTop,
        },
      ]}
    >
      {hours.map(_renderHourAndMinutes)}
      <View
        style={[
          styles.verticalLine,
          { top: spaceFromTop, backgroundColor: theme.cellBorderColor },
        ]}
      />
    </View>
  );
};

export default memo(TimelineHours);

const HourLabel = ({
  label,
  index,
  timeIntervalHeight,
  spaceContent,
  theme,
  isHour,
}: {
  label: string;
  index: number;
  timeIntervalHeight: SharedValue<number>;
  spaceContent: number;
  theme: ThemeProperties;
  isHour: boolean;
}) => {
  const labelStyle = useAnimatedStyle(() => {
    const topPosition = timeIntervalHeight.value * index + spaceContent;
    return {
      top: topPosition,
      right: isHour ? 0 : 0, // Posiciona los minutos a la derecha
    };
  });

  return (
    <Animated.Text
      allowFontScaling={theme.allowFontScaling}
      style={[
        styles.hourText,
        theme.hourText,
        labelStyle,
        { 
          fontSize: isHour ? 14 : 12, // Tamaño más pequeño para los minutos
          position: 'absolute', // Asegúrate de que este estilo sea aplicado correctamente
          color: isHour ? '#000' : '#6D6D6D',
          paddingRight: 8
        },
      ]}
    >
      {label}
    </Animated.Text>
  );
};


const styles = StyleSheet.create({
  hours: {
    position: 'relative',
    alignItems: 'center',
    overflow: 'hidden',
  },
  hourText: {
    position: 'absolute',
    color: DEFAULT_PROPS.BLACK_COLOR,
    fontWeight: 'bold'
  },
  verticalLine: {
    width: 1,
    position: 'absolute',
    right: 0,
    height: '100%',
  },
});

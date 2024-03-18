import { AnimatedFlashList, ListRenderItemInfo } from '@shopify/flash-list';
import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { DEFAULT_PROPS } from '../../../constants';
import { useTimelineCalendarContext } from '../../../context/TimelineProvider';
import type { DayBarItemProps, HighlightDates } from '../../../types';
import MultipleDayBar from './MultipleDayBar';
import ProgressBar from './ProgressBar';

interface TimelineHeaderProps {
    renderDayBarItem?: (props: DayBarItemProps) => JSX.Element;
    onPressDayNum?: (date: string) => void;
    isLoading?: boolean;
    highlightDates?: HighlightDates;
    selectedEventId?: string;
}

const TimelineHeader = ({
  renderDayBarItem,
  onPressDayNum,
  isLoading,
  highlightDates,
  selectedEventId,
}: TimelineHeaderProps) => {
  const {
    dayBarListRef,
    pages,
    rightSideWidth,
    hourWidth,
    columnWidth,
    theme,
    locale,
    tzOffset,
    currentDate,
  } = useTimelineCalendarContext();

  const extraValues = useMemo(
    () => ({ locale, highlightDates, theme, currentDate }),
    [locale, highlightDates, theme, currentDate]
  );

  const _renderMultipleDayItem = ({
    item,
    extraData,
  }: ListRenderItemInfo<string>) => {
    const dayItemProps = {
      width: rightSideWidth,
      startDate: item,
      columnWidth,
      hourWidth,
      onPressDayNum,
      theme: extraData.theme,
      locale: extraData.locale,
      highlightDates: extraData.highlightDates,
      tzOffset,
      currentDate: extraData.currentDate,
    };

    if (renderDayBarItem) {
      return renderDayBarItem(dayItemProps);
    }

    return <MultipleDayBar {...dayItemProps} />;
  };

  const _renderDayBarList = () => {
    const listProps = {
      ref: dayBarListRef,
      keyExtractor: (item: string) => item,
      scrollEnabled: false,
      disableHorizontalListHeightMeasurement: true,
      showsHorizontalScrollIndicator: false,
      horizontal: true,
      bounces: false,
      scrollEventThrottle: 16,
      pagingEnabled: true,
      extraData: extraValues,
      data: pages.day.data,
      initialScrollIndex: pages.day.index,
      estimatedItemSize: rightSideWidth,
      estimatedListSize: {
        width: rightSideWidth,
        height: DEFAULT_PROPS.DAY_BAR_HEIGHT,
      },
      renderItem: _renderMultipleDayItem,
    };

    return (
      <View style={styles.multipleDayContainer}>
        <View style={{ width: hourWidth }} />
        <View style={{ width: rightSideWidth }}>
          <AnimatedFlashList {...listProps} />
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
      {_renderDayBarList()}
      {selectedEventId && <View style={styles.disabledFrame} />}
      {isLoading && <ProgressBar barColor={theme.loadingBarColor} />}
    </View>
  );
};

export default TimelineHeader;

const styles = StyleSheet.create({
  container: {
    zIndex: 99,
  },
  multipleDayContainer: { flexDirection: 'row' },
  disabledFrame: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
});

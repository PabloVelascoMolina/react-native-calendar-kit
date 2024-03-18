import { AnimatedFlashList, ListRenderItemInfo } from '@shopify/flash-list';
import React, { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { runOnJS, useAnimatedReaction } from 'react-native-reanimated';
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
    syncedLists,
    viewMode,
    dayBarListRef,
    pages,
    rightSideWidth,
    currentIndex,
    hourWidth,
    columnWidth,
    theme,
    locale,
    tzOffset,
    currentDate,
  } = useTimelineCalendarContext();

  const [startDate, setStartDate] = useState(
    pages[viewMode].data[pages[viewMode].index] || ''
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
      viewMode,
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

  const extraValues = useMemo(
    () => ({ locale, highlightDates, theme, currentDate }),
    [locale, highlightDates, theme, currentDate]
  );

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
    };

    return (
      <View style={styles.multipleDayContainer}>
        <View style={{ width: hourWidth }} />
        <View style={{ width: rightSideWidth }}>
          <AnimatedFlashList
            {...listProps}
            data={pages[viewMode].data}
            initialScrollIndex={pages[viewMode].index}
            estimatedItemSize={rightSideWidth}
            estimatedListSize={{
              width: rightSideWidth,
              height: DEFAULT_PROPS.DAY_BAR_HEIGHT,
            }}
            renderItem={_renderMultipleDayItem}
          />
        </View>
      </View>
    );
  };

  useAnimatedReaction(
    () => currentIndex.value,
    (index) => {
      if (syncedLists) {
        return;
      }

      const dateByIndex = pages[viewMode].data[index];
      if (dateByIndex) {
        runOnJS(setStartDate)(dateByIndex);
      }
    },
    [viewMode, syncedLists]
  );

  const _renderDayBarView = () => {
    return (
      <View style={styles.multipleDayContainer}>
        <View style={{ width: hourWidth }} />
        {_renderMultipleDayItem({
          item: startDate,
          extraData: extraValues,
          index: 0,
          target: 'Cell',
        })}
      </View>
    );
  };

  return (
    <View
      style={[styles.container, { backgroundColor: theme.backgroundColor }]}
    >
      {syncedLists ? _renderDayBarList() : _renderDayBarView()}
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
    backgroundColor: 'rgba(255,255,255,0)',
  },
});

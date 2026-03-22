import React from 'react';
import { View, Text } from 'react-native';
import { BlockData, Shape } from './constants';
import DraggableBlock from './DraggableBlock';

type BlockSourceProps = {
  blocks: BlockData[];
  boardLayout: React.RefObject<{ x: number; y: number; width: number; height: number }>;
  onDrop: (blockId: number, row: number, col: number) => boolean;
  onDragMove?: (row: number, col: number, shape: Shape, color?: string) => void;
  onDragEnd?: () => void;
  onDragStart?: () => void;
};

export default function BlockSource({
  blocks,
  boardLayout,
  onDrop,
  onDragMove,
  onDragEnd,
  onDragStart,
}: BlockSourceProps) {
  return (
    <View className="mt-6 items-center">
      <Text className="text-zinc-400 text-xs mb-3 font-medium tracking-widest">
        DRAG TO PLACE
      </Text>
      <View className="flex-row justify-center items-center" style={{ gap: 16 }}>
        {blocks.map((block) => (
          <DraggableBlock
            key={block.id}
            shape={block.shape}
            color={block.color}
            blockId={block.id}
            boardLayout={boardLayout}
            onDrop={onDrop}
            onDragMove={onDragMove}
            onDragEnd={onDragEnd}
            onDragStart={onDragStart}
          />
        ))}
      </View>
    </View>
  );
}

declare module '@react-native-picker/picker' {
  import * as React from 'react';
  import { TextStyle, ViewProps } from 'react-native';

  export interface PickerItemProps {
    label: string;
    value: any;
    color?: string;
    fontFamily?: string;
  }

  export interface PickerProps extends ViewProps {
    selectedValue?: any;
    onValueChange?: (itemValue: any, itemIndex: number) => void;
    enabled?: boolean;
    mode?: 'dialog' | 'dropdown';
    itemStyle?: TextStyle;
    prompt?: string;
    testID?: string;
  }

  export class Picker extends React.Component<PickerProps> {
    static Item: React.ComponentClass<PickerItemProps>;
  }

  export class PickerIOS extends React.Component<PickerProps> {
    static Item: React.ComponentClass<PickerItemProps>;
  }

  export default Picker;
}
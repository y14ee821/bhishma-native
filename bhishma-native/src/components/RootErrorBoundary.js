import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';

export class RootErrorBoundary extends React.Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
  }

  render() {
    if (this.state.error) {
      const msg = this.state.error?.message || String(this.state.error);
      return (
        <View style={styles.wrap}>
          <Text style={styles.title}>App failed to render</Text>
          <ScrollView style={styles.scroll}>
            <Text style={styles.body}>{msg}</Text>
          </ScrollView>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: '#fff5f5',
    paddingTop: 48,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#b91c1c',
    marginBottom: 12,
  },
  scroll: { flex: 1 },
  body: { fontSize: 14, color: '#444' },
});

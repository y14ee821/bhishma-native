import { StyleSheet } from 'react-native';

export const deviceControlScreenStyles = StyleSheet.create({
  main: {
    flex: 1,
    padding: 12,
    backgroundColor: '#141414', // Dark background
  },
  statusContainer: {
    marginBottom: 24,
  },
  connectionStatusFailed: {
    backgroundColor: '#D32F2F',
    color: 'white',
    padding: 12,
    borderRadius: 8,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
    fontSize: 16,
  },
  connectionStatusConnected: {
    backgroundColor: '#388E3C',
    color: 'white',
    padding: 12,
    borderRadius: 8,
    fontWeight: '600',
    textAlign: 'center',
    fontSize: 16,
    marginBottom: 12,
  },
  infoText: {
    color: '#EDEDED',
    textAlign: 'center',
    fontWeight: 'bold',
    padding: 16,
    fontSize: 15,
  },
  refreshButton: {
    backgroundColor: '#7C4DFF',
    borderRadius: 8,
    paddingHorizontal: 18,
    paddingVertical: 10,
    marginTop: 10,
    alignSelf: 'center',
  },
  refreshButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center'
  },
  borderContainer: {
    borderWidth: 2,
    borderColor: '#2196F3',
    borderRadius: 10,
    marginBottom: 20,
    padding: 8,
  },
  bulkControlContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
  },
  allOnButton: {
    backgroundColor: '#388E3C',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
    marginRight: 8,
  },
  allOnButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
  },
  allOffButton: {
    backgroundColor: '#D32F2F',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
    marginLeft: 8,
  },
  allOffButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600'
  },
});


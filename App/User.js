import * as React from 'react';
import { View, StyleSheet, ScrollView} from 'react-native';
import {
  Container,
  Button,
  Text,
  Header,
  Left,
  Body,
  Right,
  Title,
  Form,
  Input,
  Item,
  ListItem,
  List
} from 'native-base';
import sms from 'react-native-sms-linking'
import { Constants } from 'expo';
import { BarCodeScanner, Permissions } from 'expo';
import Redeem from './redeem.js';
// You can import from local files
import AssetExample from './components/AssetExample';

// or any pure javascript modules available in npm
import BarChart from './components/BarChart'

import { Dimensions } from 'react-native';
import firebase from "./firebase.js";


export default class User extends React.Component {
  state = {
    points: 0,
    data: 
      {
        labels: ['Trash', 'Compost', 'Recycling'],
        datasets: [{
          data: [ 0, 0, 0 ]
        }]
      },
    snapshot: {
      Compost:{},
      Recycling: {},
      Trash: {}
    },
      allPlayers: []
  }

  async componentDidMount() {
    let thisUID =  this.props.user.uid;
    firebase.database().ref(thisUID).on('value', (snapshot) => {
      const numTrash = snapshot.child('Trash').numChildren()
      const numRecycle = snapshot.child('Recycling').numChildren()
      const numCompost = snapshot.child('Compost').numChildren()
      this.setState({
        data: {
          labels: ['Trash', 'Recycling', 'Compost'],
          datasets: [{
            data: [
              numTrash, 
              numRecycle, 
              numCompost
            ]
          }]
        },
        snapshot: snapshot.val(),
        points: 5*numRecycle + 2*numCompost + numTrash
      });
    });

    firebase.database().ref("/").once('value', (snapshot) => {
      let allPlayers = [];
      snapshot.forEach((child) => {
        if (child.key !== "TestData" && child.key !== "inProgress") {
          const numTrash = child.child('Trash').numChildren();
          const numRecycle = child.child('Recycling').numChildren();
          const numCompost = child.child('Compost').numChildren();

          let pointTotal = 5*numRecycle + 2*numCompost + numTrash;
          let name = child.child("name").val();

          if (child.key === thisUID) {
            name = "YOU"
          }

          allPlayers.push([pointTotal, name]);
        }
      });
      allPlayers.sort(this.sortFunc);
      this.setState({allPlayers: allPlayers})
    });
  }

  sortFunc(a, b) {
    if (a[0] === b[0]) {
      return 0;
    }
    else {
      return (a[0] > b[0]) ? -1 : 1;
    }
  }

  onScanPress = () => {
    this.props.navigate('scanner')
  }

  onRedeemPress = () => {
    this.props.navigate('redeem')
  }

  onHelpPress = () => {
    sms('2053015769').catch(console.error)
  }

  render() {
    const screenWidth = Dimensions.get('window').width;
    const chartConfig = {
      backgroundGradientFrom: '#ffffff',
      backgroundGradientTo: '#ffffff',
      color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`,
      strokeWidth: 2, // optional, default 3,
      decimalPlaces: 0
    };

    return (
      <ScrollView style={styles.container}>
          <BarChart
              style={{ marginVertical: 8, borderRadius: 16}}
              data={this.state.data}
              width={screenWidth-16}
              height={220}
              yAxisLabel={''}
              chartConfig={chartConfig}
          />
          <Text style={styles.points}>
              {this.state.points} points
          </Text>
          <Text style={styles.leaderBoardText}>Leader Board</Text>
          <List style={styles.list}>
              {this.state.allPlayers.map((item, index) =>
                  <ListItem key={item[0]}>
                      <View style={styles.listitem}>
                          {item[1] && item[0] ? (<>
                            <Text>{(index+1).toString() + ". " + item[1].toString()}</Text>
                            <Text>{item[0].toString() + " Pts"}</Text></>) : null}

                      </View>
                  </ListItem>
              )}
          </List>

          <View style={styles.buttonHolder}>
              <Button style={styles.scanButton} onPress={this.onScanPress}><Text>Scan Barcode</Text></Button>
              <Button style={styles.scanButton} onPress={this.onRedeemPress}><Text>Redeem</Text></Button>
          </View>
          <Button small info style={styles.helpButton} onPress={this.onHelpPress}><Text>Need Help?</Text></Button>
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16
  },
  paragraph: {
    margin: 24,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  points: {
    textAlign: 'center',
    margin: 24,
    fontSize: 24
  },
  leaderBoardText: {
    textAlign: 'center',
    margin: 24,
    fontSize: 20
  },
  scanButton: {
    alignSelf: 'center',
    marginRight: 10,
  },
  buttonHolder: {
    flex: 1,
    flexDirection: 'row',
    alignSelf: 'center'
  },
  list: {
    width: Dimensions.get('window').width - 20,
  },
  helpButton: {
    marginTop: 8,
    marginBottom: 64,
    alignSelf: 'center'
  },
  listitem: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between'
  }
});

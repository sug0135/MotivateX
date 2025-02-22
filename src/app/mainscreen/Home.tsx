import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  TextInput,
  ImageBackground,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { FontAwesome } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';

type Tendency = {
  id: string;
  cause: string;  // タスク名
  score: number;  // 同要因の割合(%)
  detail: string; // 大要因・小要因の文字列など
};

const backgroundImage = require('../../../assets/profilebackground.png');

const Home = () => {
  const [tendencies, setTendencies] = useState<Tendency[]>([]);
  const [savedGoal, setSavedGoal] = useState<string>('');

  const isFocused = useIsFocused();

  const loadData = useCallback(async () => {
    try {
      const tasksJSON = await AsyncStorage.getItem('tasks');
      if (!tasksJSON) {
        setTendencies([]);
        return;
      }
 
      const tasks = JSON.parse(tasksJSON) as {
        task: string;
        count: number;
        majorReason: string | null;
        minorReasons: string[];
      }[];
  
      const minorReasonCounts: Record<string, { count: number }> = {};
      let totalMinorReasons = 0;
      
      tasks.forEach((t) => {
        t.minorReasons.forEach((reason) => {
          minorReasonCounts[reason] = minorReasonCounts[reason] || { count: 0 };
          minorReasonCounts[reason].count += 1;
          totalMinorReasons++;
        });
      });
       
      const newTendencies: Tendency[] = Object.keys(minorReasonCounts).map((reason, index) => {
        const data = minorReasonCounts[reason];
        const score = Math.round((data.count / totalMinorReasons) * 100);
        return {
          id: `minor-${index}`,
          cause: reason,
          score: score,
          detail: `この要因が関係した回数: ${data.count}回`,
        };
      });
      
      // ここでスコアの降順にソート！
      newTendencies.sort((a, b) => b.score - a.score);
      
      setTendencies(newTendencies);
      
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }, []);

  useEffect(() => {
    if (isFocused) {
      loadData();
    }
  }, [isFocused, loadData]);

  return (
    <ImageBackground source={backgroundImage} style={styles.backgroundImage}>
      <KeyboardAwareScrollView 
        contentContainerStyle={styles.scrollView} 
        keyboardShouldPersistTaps="handled"
        extraScrollHeight={100}
      >
        <SafeAreaView style={styles.innerContainer}>

          {/* STEP 2: 分析結果 */}
          <View style={[styles.box, styles.tendencyBox]}>
            <View style={[styles.headerContainer, styles.tendencyHeader]}>
              <Text style={styles.headerText}>STEP 2: 分析結果</Text>
            </View>
            <View style={styles.contentContainer}>
              <FlatList
                data={tendencies}
                renderItem={({ item }) => (
                  <View style={styles.itemContainer}>
                    <Text style={styles.itemText}>{item.cause}</Text>
                    <Text style={styles.itemScore}>{item.score}%</Text>
                  </View>
                )}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContainer}
                ItemSeparatorComponent={() => <View style={{ height: 15 }} />}
              />
            </View>
          </View>

          {/* STEP 3: 本日のTODO */}
          <View style={[styles.box, styles.actionPlanBox]}>
            <View style={[styles.headerContainer, styles.actionPlanHeader]}>
              <FontAwesome size={18} color="#FFFFFF" style={styles.headerIcon} />
              <Text style={styles.headerText}>STEP 3: 本日のTODO</Text>
            </View>
            <View style={[styles.contentContainer, styles.centerContent]}>
              <TextInput
                style={styles.textInput}
                placeholder="行動目標を入力してください。"
                value={savedGoal}
                onChangeText={async (text) => {
                  setSavedGoal(text);
                  await AsyncStorage.setItem('@weekly_goal', text);
                }}
                multiline
              />
            </View>
          </View>

          <StatusBar style="auto" />
        </SafeAreaView>
      </KeyboardAwareScrollView>
    </ImageBackground>
  );
};

export default Home;

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
  },
  scrollView: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerContainer: {
    margin: 50,
    flex: 1,
    alignItems: 'center',
    width: '100%',
  },
  box: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    width: '85%',
    marginVertical: 8,
  },
  tendencyBox: {},
  actionPlanBox: {
    marginBottom: 5,
    textAlign: 'center',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 10,
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  actionPlanHeader: {
    backgroundColor: '#737373',
  },
  tendencyHeader: {
    backgroundColor: '#ea9532',
  },
  contentContainer: {
    padding: 15,
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    padding: 10,
    borderRadius: 10,
  },
  itemText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  itemScore: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  listContainer: {},
  headerIcon: {
    marginRight: 6,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  textInput: {
    fontSize: 18,
    textAlign: 'center',
    height: 50,
    width: '100%',
    backgroundColor: '#f2f2f2',
    borderRadius: 10,
    padding: 12,
    textAlignVertical: 'top',
  },
});
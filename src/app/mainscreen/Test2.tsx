import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView, Modal, TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useFonts, Poppins_400Regular, Poppins_700Bold } from '@expo-google-fonts/poppins';
import AppLoading from 'expo-app-loading';
import { firestore } from '../../firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';

type Tendency = {
  id: string;
  name: string;
  score: number;
  plan: string;
};

const Home = () => {
  const [tendencies, setTendencies] = useState<Tendency[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTendency, setSelectedTendency] = useState<Tendency | null>(null);
  const [weeklyGoal, setWeeklyGoal] = useState<string | null>(null);

  let [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_700Bold,
  });

  if (!fontsLoaded) {
    return <AppLoading />;
  }

  useEffect(() => {
    const fetchTendencies = async () => {
      try {
        const membersSnapshot = await getDocs(collection(firestore, 'members'));
        const allTendencies: Tendency[] = [];

        for (const memberDoc of membersSnapshot.docs) {
          const tendenciesCollectionRef = collection(firestore, `members/${memberDoc.id}/tendencies`);
          const tendenciesQuery = query(tendenciesCollectionRef, orderBy('score', 'desc'), limit(10));
          const tendenciesSnapshot = await getDocs(tendenciesQuery);

          const memberTendencies = tendenciesSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Tendency[];

          allTendencies.push(...memberTendencies);
        }

        const totalScore = allTendencies.reduce((sum, tendency) => sum + Number(tendency.score), 0);

        const tendenciesWithPercentage = allTendencies.map((tendency) => ({
          ...tendency,
          scorePercentage: totalScore > 0 ? ((Number(tendency.score) / totalScore) * 100).toFixed(1) : "0.00",
        }));

        const sortedTendencies = tendenciesWithPercentage.sort((a, b) => b.score - a.score);

        if (sortedTendencies.length === 0) {
          console.warn('No tendencies data found in Firestore.');
        }

        setTendencies(sortedTendencies);
      } catch (error) {
        console.error("Error fetching tendencies: ", error);
      }
    };

    fetchTendencies();
  }, []);

  const handleItemPress = (tendency: Tendency) => {
    setSelectedTendency(tendency);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedTendency(null);
  };

  const setAsWeeklyGoal = () => {
    if (selectedTendency) {
      setWeeklyGoal(selectedTendency.plan);
      closeModal();
    }
  };

  const renderItem = ({ item, index }: { item: Tendency; index: number }) => (
    <TouchableOpacity onPress={() => handleItemPress(item)}>
      <View style={[styles.itemContainer, index < 3 && styles.highlightedItem]}>
        {index < 3 ? (
          <View style={styles.indexContainer}>
            <FontAwesome name="star" size={24} color={index === 0 ? "gold" : index === 1 ? "silver" : "#cd7f32"} />
            <Text style={styles.index}>{index + 1}</Text>
          </View>
        ) : (
          <Text style={styles.normalIndex}>{index + 1}</Text>
        )}
        <Text style={styles.itemText}>{item.name}</Text>
        <Text style={styles.itemScore}>{item.scorePercentage}%</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.box}>
        <View style={styles.goalHeader}>
          <Text style={styles.actionPlanTitleHeader}>今週の行動目標</Text>
        </View>
        {weeklyGoal ? (
          <View style={styles.weeklyGoalContainer}>
            <Text style={styles.weeklyGoalText}>{weeklyGoal}</Text>
          </View>
        ) : (
          <Text style={styles.noGoalText}>行動目標が設定されていません。</Text>
        )}
      </View>

      <View style={styles.box}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>先延ばし克服対象選択</Text>
        </View>
        <FlatList
          data={tendencies}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
        />
      </View>

      {selectedTendency && (
        <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={closeModal}>
          <View style={styles.modalContainer}>
            <View style={styles.modalView}>
              <Text style={styles.modalTitle}>{selectedTendency.name}</Text>
              <Text style={styles.modalContent}>{selectedTendency.plan}</Text>
              <TouchableOpacity onPress={setAsWeeklyGoal} style={styles.setGoalButton}>
                <Text style={styles.setGoalButtonText}>今週の行動目標に設定</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>閉じる</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      <StatusBar style="auto" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    marginTop: 60,
    backgroundColor: '#F4F6F9',
  },
  box: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  goalHeader: {
    backgroundColor: '#FFFFFF',
    borderColor: '#ff914d',
    borderWidth: 2,
    borderRadius: 10,
    padding: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionHeader: {
    backgroundColor: '#FFFFFF',
    borderColor: '#75d0df',
    borderWidth: 2,
    borderRadius: 10,
    padding: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  actionPlanTitleHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ff914d',
    fontFamily: 'Poppins_700Bold',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'Poppins_700Bold',
  },
  weeklyGoalContainer: {
    backgroundColor: '#FFE4D0',
    borderRadius: 10,
    padding: 15,
    marginVertical: 10,
  },
  weeklyGoalText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF5C1B',
    textAlign: 'center',
    fontFamily: 'Poppins_700Bold',
  },
  noGoalText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    paddingVertical: 10,
    fontFamily: 'Poppins_400Regular',
  },
  listContainer: {
    paddingBottom: 20,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    marginBottom: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  highlightedItem: {
    backgroundColor: '#FFF9E6',
  },
  indexContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  index: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4A4A4A',
    marginLeft: 5,
    fontFamily: 'Poppins_700Bold',
  },
  normalIndex: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4A4A4A',
    fontFamily: 'Poppins_700Bold',
  },
  itemText: {
    fontSize: 16,
    flex: 1,
    color: '#4A4A4A',
    marginLeft: 10,
    fontFamily: 'Poppins_400Regular',
  },
  itemScore: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF5C1B',
    fontFamily: 'Poppins_700Bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    width: 300,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#4A4A4A',
    fontFamily: 'Poppins_700Bold',
  },
  modalContent: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    color: '#4A4A4A',
    fontFamily: 'Poppins_400Regular',
  },
  closeButton: {
    backgroundColor: '#FF5C1B',
    borderRadius: 10,
    padding: 10,
    elevation: 2,
    marginTop: 10,
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontFamily: 'Poppins_700Bold',
  },
  setGoalButton: {
    backgroundColor: '#FF5C1B',
    borderRadius: 10,
    padding: 10,
    elevation: 2,
    marginTop: 10,
  },
  setGoalButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontFamily: 'Poppins_700Bold',
  },
});
export default Home;
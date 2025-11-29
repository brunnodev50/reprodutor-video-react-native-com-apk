import { Ionicons } from '@expo/vector-icons';
import { ResizeMode, Video } from 'expo-av';
import * as ImagePicker from 'expo-image-picker';
import React, { useRef, useState } from 'react';
import { Dimensions, SafeAreaView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

// Função auxiliar para formatar o tempo (mm:ss)
const formatTime = (millis) => {
  if (!millis || millis < 0) return "00:00";
  const totalSeconds = Math.floor(millis / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
};

export default function VideoPlayerScreen() {
  const videoRef = useRef(null);
  const [status, setStatus] = useState({});
  const [videoSource, setVideoSource] = useState(null);
  const [videoName, setVideoName] = useState(""); // Estado para guardar o nome

  const pickVideo = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('É necessária permissão para acessar a galeria!');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: false, // Em Android, editing as vezes altera o nome do arquivo
      quality: 1,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      setVideoSource(asset.uri);
      
      // Lógica para pegar o nome do arquivo (FileName ou extrai da URI)
      let name = asset.fileName;
      if (!name) {
        // Fallback: pega o final da url (ex: file:///.../video123.mp4)
        name = asset.uri.split('/').pop();
      }
      setVideoName(name);
      
      setStatus({});
    }
  };

  const togglePlayPause = () => {
    if (status.isPlaying) {
      videoRef.current.pauseAsync();
    } else {
      videoRef.current.playAsync();
    }
  };

  const changeVolume = async (amount) => {
    if (videoRef.current) {
      const newVolume = (status.volume || 1.0) + amount;
      const finalVolume = Math.max(0, Math.min(1, newVolume));
      await videoRef.current.setVolumeAsync(finalVolume);
    }
  };

  const seekVideo = async (seconds) => {
    if (videoRef.current && status.positionMillis !== undefined) {
      const newPosition = status.positionMillis + (seconds * 1000);
      await videoRef.current.setPositionAsync(newPosition);
    }
  };

  const getProgress = () => {
    if (status.durationMillis > 0 && status.positionMillis > 0) {
      return (status.positionMillis / status.durationMillis) * 100;
    }
    return 0;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#121212" />
      
      <View style={styles.container}>
        
        {/* CABEÇALHO DO APP */}
        <View style={styles.header}>
          <Ionicons name="play-circle" size={28} color="#E50914" />
          <Text style={styles.headerTitle}>Reprodutor de Vídeo Bru</Text>
        </View>

        {/* NOME DO ARQUIVO (Aparece se tiver vídeo) */}
        {videoSource && (
          <View style={styles.fileInfoContainer}>
            <Text style={styles.fileNameText} numberOfLines={1}>
              Tocando: {videoName}
            </Text>
          </View>
        )}

        {/* ÁREA DO VÍDEO */}
        <View style={styles.videoContainer}>
          {videoSource ? (
            <Video
              ref={videoRef}
              style={styles.video}
              source={{ uri: videoSource }}
              resizeMode={ResizeMode.CONTAIN}
              isLooping
              progressUpdateIntervalMillis={500}
              onPlaybackStatusUpdate={status => setStatus(() => status)}
            />
          ) : (
            <View style={styles.placeholder}>
              <Ionicons name="film-outline" size={80} color="#333" />
              <Text style={styles.placeholderText}>Selecione um vídeo para começar</Text>
            </View>
          )}
        </View>

        {/* CONTROLES */}
        <View style={styles.controlsContainer}>
          
          <TouchableOpacity style={styles.selectButton} onPress={pickVideo}>
            <Ionicons name="library-outline" size={24} color="#fff" />
            <Text style={styles.selectButtonText}>Abrir Galeria</Text>
          </TouchableOpacity>

          {videoSource && (
            <>
              {/* Barra de Tempo */}
              <View style={styles.timeInfoContainer}>
                <Text style={styles.timeText}>{formatTime(status.positionMillis)}</Text>
                
                <View style={styles.progressBarBackground}>
                  <View style={{ 
                    width: `${getProgress()}%`, 
                    height: '100%', 
                    backgroundColor: '#E50914', 
                    borderRadius: 2 
                  }} />
                </View>

                <Text style={styles.timeText}>{formatTime(status.durationMillis)}</Text>
              </View>

              {/* Botões Principais */}
              <View style={styles.mainControls}>
                <TouchableOpacity onPress={() => seekVideo(-10)}>
                  <Ionicons name="play-back" size={35} color="#fff" />
                </TouchableOpacity>

                <TouchableOpacity onPress={togglePlayPause} style={styles.playButton}>
                  <Ionicons 
                    name={status.isPlaying ? "pause" : "play"} 
                    size={45} 
                    color="#000" 
                    style={{ marginLeft: status.isPlaying ? 0 : 4 }}
                  />
                </TouchableOpacity>

                <TouchableOpacity onPress={() => seekVideo(10)}>
                  <Ionicons name="play-forward" size={35} color="#fff" />
                </TouchableOpacity>
              </View>

              {/* Volume */}
              <View style={styles.volumeControls}>
                <Ionicons name="volume-medium" size={24} color="#ccc" style={{ marginRight: 10 }}/>
                <TouchableOpacity onPress={() => changeVolume(-0.1)}>
                  <Ionicons name="remove-circle-outline" size={28} color="#ccc" />
                </TouchableOpacity>
                
                <View style={styles.volumeBarContainer}>
                  <View style={{ 
                    width: `${(status.volume || 1) * 100}%`, 
                    height: '100%', 
                    backgroundColor: '#4ade80' 
                  }} />
                </View>

                <TouchableOpacity onPress={() => changeVolume(0.1)}>
                  <Ionicons name="add-circle-outline" size={28} color="#ccc" />
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#121212',
  },
  container: {
    flex: 1,
    backgroundColor: '#121212',
    justifyContent: 'flex-start',
  },
  // ESTILO DO TÍTULO DO APP
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    backgroundColor: '#1a1a1a',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 10,
    letterSpacing: 1,
  },
  // ESTILO DO NOME DO ARQUIVO
  fileInfoContainer: {
    padding: 10,
    alignItems: 'center',
  },
  fileNameText: {
    color: '#aaa',
    fontSize: 14,
    fontStyle: 'italic',
  },
  // VÍDEO
  videoContainer: {
    width: width,
    height: 250,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
  },
  video: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    color: '#555',
    marginTop: 10,
    fontSize: 14,
  },
  // CONTROLES
  controlsContainer: {
    padding: 20,
    alignItems: 'center',
    flex: 1,
  },
  selectButton: {
    flexDirection: 'row',
    backgroundColor: '#2a2a2a',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 50,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#444',
  },
  selectButtonText: {
    color: '#fff',
    marginLeft: 10,
    fontSize: 14,
    fontWeight: '600',
  },
  timeInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
    justifyContent: 'space-between',
  },
  timeText: {
    color: '#fff',
    fontSize: 12,
    fontVariant: ['tabular-nums'],
    width: 45,
    textAlign: 'center',
  },
  progressBarBackground: {
    flex: 1,
    height: 4,
    backgroundColor: '#444',
    marginHorizontal: 10,
    borderRadius: 2,
    overflow: 'hidden',
  },
  mainControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 25,
    gap: 40,
  },
  playButton: {
    backgroundColor: '#fff',
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  volumeControls: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '90%',
    backgroundColor: '#1e1e1e',
    padding: 10,
    borderRadius: 20,
    justifyContent: 'center',
  },
  volumeBarContainer: {
    flex: 1,
    height: 4,
    backgroundColor: '#333',
    marginHorizontal: 15,
    borderRadius: 2,
    overflow: 'hidden',
  },
});
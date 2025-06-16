import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Container,
  Typography,
  Button,
  Box,
  Paper,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  LinearProgress,
  TextField,
  Card,
  CardContent,
  Grid,
} from '@mui/material';
import DrawingCanvas from '../shared/DrawingCanvas';
import { API_URL } from '../config';

interface Question {
  id: number;
  category: string;
  text: string;
  type: 'text' | 'radio' | 'drawing' | 'memory' | 'tapping';
  options?: string[];
  maxPoints: number;
  points: number;
}

const questions: Question[] = [
  {
    id: 1,
    category: 'Ориентировка во времени и месте',
    text: 'Назовите сегодняшнюю дату, месяц, год, день недели',
    type: 'text',
    maxPoints: 6,
    points: 0,
  },
  {
    id: 2,
    category: 'Запоминание слов',
    text: 'Повторите следующие слова: лист, церковь, цветок, перо, красный',
    type: 'memory',
    maxPoints: 5,
    points: 0,
  },
  {
    id: 3,
    category: 'Внимание',
    text: 'Повторите цифры: 5-8-2',
    type: 'text',
    maxPoints: 3,
    points: 0,
  },
  {
    id: 4,
    category: 'Внимание',
    text: 'Скажите в обратном порядке: 7-4-1',
    type: 'text',
    maxPoints: 3,
    points: 0,
  },
  {
    id: 5,
    category: 'Внимание',
    text: 'Хлопните, когда услышите букву "А" в последовательности: Б-А-Л-А-Т-А-К',
    type: 'tapping',
    maxPoints: 6,
    points: 0,
  },
  {
    id: 6,
    category: 'Речь',
    text: 'Повторите фразу: "Никаких если, и или но"',
    type: 'text',
    maxPoints: 1,
    points: 0,
  },
  {
    id: 7,
    category: 'Речь',
    text: 'Назовите изображенные предметы',
    type: 'radio',
    options: ['верблюд', 'лев'],
    maxPoints: 2,
    points: 0,
  },
  {
    id: 8,
    category: 'Абстрактное мышление',
    text: 'Чем похожи яблоко и груша?',
    type: 'text',
    maxPoints: 2,
    points: 0,
  },
  {
    id: 9,
    category: 'Тест с часами',
    text: 'Нарисуйте круглые часы, расставьте цифры и укажите время "11:10"',
    type: 'drawing',
    maxPoints: 4,
    points: 0,
  },
  {
    id: 10,
    category: 'Отсроченное воспроизведение',
    text: 'Повторите слова, которые вы запомнили в начале теста',
    type: 'memory',
    maxPoints: 5,
    points: 0,
  },
  {
    id: 11,
    category: 'Ориентировка в пространстве',
    text: 'На каком этаже мы находимся?',
    type: 'text',
    maxPoints: 1,
    points: 0,
  },
];

const Question: React.FC = () => {
  const { questionNumber } = useParams<{ questionNumber: string }>();
  const navigate = useNavigate();
  const currentQuestionIndex = parseInt(questionNumber || '1') - 1;
  const currentQuestion = questions[currentQuestionIndex];
  const isAnimalQuestion = currentQuestion.id === 7;
  const isDrawingQuestion = currentQuestion.id === 9;
  const [answer, setAnswer] = useState<any>(isAnimalQuestion ? { 0: '', 1: '', 2: '' } : '');
  const [answers, setAnswers] = useState<Record<number, any>>({});
  const [timer, setTimer] = useState<number | null>(null);
  const [error, setError] = useState<string>('');
  const [tapped, setTapped] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isSpeechQuestion = currentQuestion.id === 6;
  const [isSpeechRecording, setIsSpeechRecording] = useState(false);
  const [speechAudioUrl, setSpeechAudioUrl] = useState<string | null>(null);
  const [speechRecordingSupported, setSpeechRecordingSupported] = useState(true);

  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  useEffect(() => {
    if (currentQuestion?.type === 'memory' && currentQuestion.id === 2) {
      setTimer(5);
      const interval = setInterval(() => {
        setTimer((prev) => {
          if (prev === null || prev <= 1) {
            clearInterval(interval);
            if (currentQuestionIndex < questions.length - 1) {
              navigate(`/question/${currentQuestionIndex + 2}`);
            }
            return null;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
    if (currentQuestion.id === 7) setAnswer({ 0: '', 1: '', 2: '' });
    else setAnswer('');
    setTapped(false);
    if (currentQuestion.type === 'tapping') {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
          const mediaRecorder = new window.MediaRecorder(stream);
          mediaRecorderRef.current = mediaRecorder;
          audioChunksRef.current = [];
          mediaRecorder.start();
          setIsRecording(true);
          mediaRecorder.ondataavailable = e => {
            audioChunksRef.current.push(e.data);
          };
        }).catch(error => {
          setError('Ошибка доступа к микрофону');
        });
      } else {
        setError('Ваш браузер не поддерживает запись аудио');
      }
    }
    if (isSpeechQuestion) {
      if (
        typeof window.MediaRecorder === 'undefined' ||
        !navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia
      ) {
        setSpeechRecordingSupported(false);
      } else {
        setSpeechRecordingSupported(true);
      }
    }
    return () => {
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
        setIsRecording(false);
      }
    };
  }, [currentQuestion]);

  const handleAnswerChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAnswer(event.target.value);
  };

  const isAnswerFilled = () => {
    if (isAnimalQuestion) {
      return Object.values(answer).every(v => String(v).trim() !== '');
    }
    if (isDrawingQuestion) {
      return !!answer;
    }
    return !!answer;
  };

  const handleStartSpeechRecording = async () => {
    setError('');
    if (!speechRecordingSupported) {
      setError('Ваш браузер не поддерживает запись аудио. Вы можете продолжить без записи.');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new window.MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      mediaRecorder.start();
      setIsSpeechRecording(true);
      mediaRecorder.ondataavailable = e => {
        audioChunksRef.current.push(e.data);
      };
      mediaRecorder.onstop = () => {
        setIsSpeechRecording(false);
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setSpeechAudioUrl(URL.createObjectURL(audioBlob));
      };
    } catch (e) {
      setError('Ошибка доступа к микрофону. Вы можете продолжить без записи.');
    }
  };

  const handleStopSpeechRecording = () => {
    if (mediaRecorderRef.current && isSpeechRecording) {
      mediaRecorderRef.current.stop();
      setIsSpeechRecording(false);
    }
  };

  const handleNext = async () => {
    setError('');
    if ((currentQuestion.type === 'tapping' || currentQuestion.id === 6) && isRecording && mediaRecorderRef.current) {
      setIsUploading(true);
      await new Promise<void>((resolve) => {
        if (mediaRecorderRef.current) {
          mediaRecorderRef.current.onstop = () => {
            resolve();
          };
          mediaRecorderRef.current.requestData();
          mediaRecorderRef.current.stop();
          setIsRecording(false);
        } else {
          resolve();
        }
      });
      try {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const formData = new FormData();
        formData.append('audio', audioBlob, currentQuestion.id === 6 ? 'speech.webm' : 'tapping.webm');
        const response = await fetch(`${API_URL}/upload-audio/`, {
          method: 'POST',
          body: formData,
        });
        const data = await response.json();
        const newAnswers = { ...answers, [currentQuestion.id]: { answer, audio: data.audio_path } };
        setAnswers(newAnswers);
        setIsUploading(false);
        if (currentQuestionIndex < questions.length - 1) {
          navigate(`/question/${currentQuestionIndex + 2}`);
        } else {
          const testData = {
            answers_package: newAnswers,
          };
          fetch(`${API_URL}/test/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(testData),
          })
            .then(response => response.json())
            .then(data => {
              navigate('/results', { state: { testId: data.id } });
            })
            .catch(error => {
              console.error('Error:', error);
              navigate('/results', { state: { testId: 'error' } });
            });
        }
      } catch (e) {
        setError('Ошибка загрузки аудио');
        setIsUploading(false);
      }
      return;
    }
    if (!isAnswerFilled()) {
      setError('Пожалуйста, заполните ответ');
      return;
    }
    const newAnswers = { ...answers, [currentQuestion.id]: answer };
    setAnswers(newAnswers);
    if (currentQuestionIndex < questions.length - 1) {
      navigate(`/question/${currentQuestionIndex + 2}`);
    } else {
      try {
        const testData = {
          answers_package: newAnswers,
        };
        const response = await fetch(`${API_URL}/test/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(testData),
        });
        if (!response.ok) {
          throw new Error('Ошибка сохранения теста');
        }
        const responseData = await response.json();
        navigate('/results', { state: { testId: responseData.id } });
      } catch (error) {
        console.error('Error:', error);
        setError('Произошла ошибка при сохранении теста. Пожалуйста, попробуйте еще раз.');
      }
    }
  };

  if (!currentQuestion) {
    return (
      <Container>
        <Typography>Вопрос не найден</Typography>
      </Container>
    );
  }

  const renderQuestionContent = () => {
    if (currentQuestion.id === 2) {
      return (
        <Box>
          <Typography variant="body1" gutterBottom>
            {currentQuestion.text}
          </Typography>
          {timer !== null && (
            <Typography variant="h6" color="primary">
              Осталось времени: {timer} секунд
            </Typography>
          )}
        </Box>
      );
    }
    if (currentQuestion.id === 10) {
      return (
        <Box>
          <Typography variant="body1" gutterBottom>
            {currentQuestion.text}
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            value={answer}
            onChange={handleAnswerChange}
            placeholder="Введите запомненные слова"
          />
        </Box>
      );
    }
    if (currentQuestion.id === 7) {
      return (
        <Box>
          <img src="/animals.png" alt="Животные" style={{ width: '100%', maxWidth: 500, marginBottom: 16 }} />
          <Grid container spacing={2} justifyContent="center">
            <Grid item xs={4}>
              <TextField
                fullWidth
                label="1."
                value={answer[0] || ''}
                onChange={e => setAnswer({ ...answer, 0: e.target.value })}
                placeholder="Кто это?"
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                fullWidth
                label="2."
                value={answer[1] || ''}
                onChange={e => setAnswer({ ...answer, 1: e.target.value })}
                placeholder="Кто это?"
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                fullWidth
                label="3."
                value={answer[2] || ''}
                onChange={e => setAnswer({ ...answer, 2: e.target.value })}
                placeholder="Кто это?"
              />
            </Grid>
          </Grid>
        </Box>
      );
    }
    if (currentQuestion.id === 9) {
      return (
        <Box>
          <Typography variant="body1" gutterBottom>
            {currentQuestion.text}
          </Typography>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            gap: 2,
            width: '100%'
          }}>
            <DrawingCanvas 
              width={350} 
              height={350} 
              onChange={dataUrl => setAnswer(dataUrl)} 
            />
            <Typography variant="body2" color="text.secondary" align="center">
              Нарисуйте часы, расставьте цифры и укажите время "11:10"
            </Typography>
          </Box>
        </Box>
      );
    }
    if (currentQuestion.id === 6) {
      return (
        <Box>
          <Typography variant="body1" gutterBottom>
            {currentQuestion.text}
          </Typography>
          <Button
            variant="contained"
            color={isRecording ? 'secondary' : 'primary'}
            onClick={async () => {
              if (!isRecording) {
                // Начать запись
                if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                  setError('Ваш браузер не поддерживает запись аудио');
                  return;
                }
                try {
                  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                  const mediaRecorder = new window.MediaRecorder(stream);
                  mediaRecorderRef.current = mediaRecorder;
                  audioChunksRef.current = [];
                  mediaRecorder.start();
                  setIsRecording(true);
                  mediaRecorder.ondataavailable = e => {
                    audioChunksRef.current.push(e.data);
                  };
                } catch (e) {
                  setError('Ошибка доступа к микрофону');
                }
              }
            }}
            disabled={isRecording || isUploading}
            sx={{ mt: 2 }}
          >
            {isRecording ? 'Идет запись...' : 'Начать запись'}
          </Button>
        </Box>
      );
    }
    if (isSpeechQuestion) {
      return (
        <Box>
          <Typography variant="body1" gutterBottom>
            {currentQuestion.text}
          </Typography>
          {!speechRecordingSupported && (
            <Typography color="error" sx={{ mb: 2 }}>
              Ваш браузер не поддерживает запись аудио. Вы можете продолжить без записи.
            </Typography>
          )}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            {speechRecordingSupported && !isSpeechRecording ? (
              <Button variant="contained" color="primary" onClick={handleStartSpeechRecording} disabled={isUploading}>
                Начать запись
              </Button>
            ) : null}
            {speechRecordingSupported && isSpeechRecording ? (
              <Button variant="contained" color="secondary" onClick={handleStopSpeechRecording}>
                Остановить запись
              </Button>
            ) : null}
            {speechAudioUrl && (
              <audio controls src={speechAudioUrl} style={{ marginTop: 16 }} />
            )}
          </Box>
        </Box>
      );
    }
    switch (currentQuestion.type) {
      case 'text':
        return (
          <TextField
            fullWidth
            multiline
            rows={4}
            value={answer}
            onChange={handleAnswerChange}
            placeholder="Введите ваш ответ"
          />
        );
      case 'radio':
        return (
          <FormControl component="fieldset">
            <RadioGroup value={answer} onChange={handleAnswerChange}>
              {currentQuestion.options?.map((option, index) => (
                <FormControlLabel
                  key={index}
                  value={option}
                  control={<Radio />}
                  label={option}
                />
              ))}
            </RadioGroup>
          </FormControl>
        );
      case 'memory':
        return (
          <Box>
            <Typography variant="body1" gutterBottom>
              {currentQuestion.text}
            </Typography>
            {timer !== null && (
              <Typography variant="h6" color="primary">
                Осталось времени: {timer} секунд
              </Typography>
            )}
            <TextField
              fullWidth
              multiline
              rows={4}
              value={answer}
              onChange={handleAnswerChange}
              placeholder="Введите запомненные слова"
            />
          </Box>
        );
      case 'drawing':
        return (
          <Box>
            <Typography variant="body1" gutterBottom>
              {currentQuestion.text}
            </Typography>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              gap: 2,
              width: '100%'
            }}>
              <DrawingCanvas 
                width={350} 
                height={350} 
                onChange={dataUrl => setAnswer(dataUrl)} 
              />
              <Typography variant="body2" color="text.secondary" align="center">
                Нарисуйте часы, расставьте цифры и укажите время "11:10"
              </Typography>
            </Box>
          </Box>
        );
      case 'tapping':
        return (
          <Box>
            <Typography variant="body1" gutterBottom>
              {currentQuestion.text}
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                setAnswer((prev: string) => prev + 'tap');
                setTapped(true);
                if (audioRef.current) {
                  audioRef.current.currentTime = 0;
                  audioRef.current.play().catch(error => {
                    setError('Ошибка воспроизведения звука');
                  });
                }
              }}
            >
              Хлопнуть
            </Button>
            <audio
              ref={audioRef}
              src="/балатак.wav"
              style={{ display: 'none' }}
              preload="auto"
            />
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 4,
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: 3,
          }}
        >
          <LinearProgress variant="determinate" value={progress} />
          <Typography variant="h5" component="h2" gutterBottom>
            {currentQuestion.category}
          </Typography>
          <Typography variant="h6" component="h3" gutterBottom>
            {currentQuestion.text}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Максимальный балл: {currentQuestion.maxPoints}
          </Typography>
          {error && (
            <Typography color="error" sx={{ mb: 1 }}>{error}</Typography>
          )}
          {renderQuestionContent()}
          <Button
            variant="contained"
            onClick={handleNext}
            sx={{ mt: 2 }}
            disabled={(currentQuestion.type === 'tapping' && (!tapped || isUploading)) || isUploading}
          >
            {currentQuestionIndex < questions.length - 1 ? 'Следующий вопрос' : 'Завершить тест'}
          </Button>
        </Paper>
      </Box>
    </Container>
  );
};

export default Question; 
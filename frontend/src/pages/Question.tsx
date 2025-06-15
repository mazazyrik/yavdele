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
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      }
      navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
        const mediaRecorder = new window.MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];
        mediaRecorder.start();
        setIsRecording(true);
        mediaRecorder.ondataavailable = e => {
          audioChunksRef.current.push(e.data);
        };
      });
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

  const handleNext = async () => {
    setError('');
    if (!isAnswerFilled()) {
      setError('Пожалуйста, заполните ответ');
      return;
    }
    if (currentQuestion.type === 'tapping' && isRecording && mediaRecorderRef.current) {
      setIsUploading(true);
      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const formData = new FormData();
        formData.append('audio', audioBlob, 'tapping.webm');
        try {
          const response = await fetch('http://194.87.216.212:8000/api/upload-audio/', {
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
            fetch('http://194.87.216.212:8000/api/test/', {
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
      };
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      return;
    }
    const newAnswers = { ...answers, [currentQuestion.id]: answer };
    setAnswers(newAnswers);
    if (currentQuestionIndex < questions.length - 1) {
      navigate(`/question/${currentQuestionIndex + 2}`);
    } else {
      const testData = {
        answers_package: newAnswers,
      };
      fetch('http://194.87.216.212:8000/api/test/', {
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
          <DrawingCanvas width={350} height={350} onChange={dataUrl => setAnswer(dataUrl)} />
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
            <Card>
              <CardContent>
                <Box
                  sx={{
                    width: '100%',
                    height: '300px',
                    border: '1px dashed grey',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Typography color="textSecondary">
                    Здесь будет область для рисования
                  </Typography>
                </Box>
              </CardContent>
            </Card>
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
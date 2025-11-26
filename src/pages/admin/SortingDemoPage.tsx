import { useState, useEffect, useRef } from "react";
import {
  Container,
  Typography,
  Box,
  Button,
  Slider,
  Paper,
} from "@mui/material";
import { motion } from "framer-motion";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import ShuffleIcon from "@mui/icons-material/Shuffle";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

const SortingDemoPage = () => {
  const [array, setArray] = useState<number[]>([]);
  const [arraySize, setArraySize] = useState(45); // Tamaño del array
  const [sorting, setSorting] = useState(false);
  const [paused, setPaused] = useState(false);
  const [speed, setSpeed] = useState(50); // ms por comparación
  const [showValues, setShowValues] = useState(false); // Mostrar valores numéricos
  const [comparingIndices, setComparingIndices] = useState<number[]>([]);
  const [maxIndex, setMaxIndex] = useState<number | null>(null); // Índice del elemento más grande en la comparación actual
  const [sortedIndices, setSortedIndices] = useState<Set<number>>(new Set());
  const originalArrayRef = useRef<number[]>([]);
  const sortingRef = useRef(false);
  const pausedRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const shouldRegenerateOnSizeChange = useRef(false); // Flag para controlar regeneración

  // Sincronizar refs con estados
  useEffect(() => {
    sortingRef.current = sorting;
    pausedRef.current = paused;
  }, [sorting, paused]);

  // Generar array aleatorio
  const generateRandomArray = (size?: number) => {
    // Cancelar cualquier ordenación en curso
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setSorting(false);
    setPaused(false);
    sortingRef.current = false;
    pausedRef.current = false;

    const sizeToUse = size || arraySize;
    const newArray = Array.from({ length: sizeToUse }, () =>
      Math.floor(Math.random() * (300 - 10 + 1) + 10)
    );
    setArray(newArray);
    originalArrayRef.current = [...newArray];
    setSortedIndices(new Set());
    setComparingIndices([]);
    setMaxIndex(null);
  };

  // Regenerar array cuando cambia el tamaño (solo si el flag está activo y no está ordenando)
  useEffect(() => {
    if (shouldRegenerateOnSizeChange.current && !sorting && array.length !== arraySize) {
      generateRandomArray(arraySize);
      shouldRegenerateOnSizeChange.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [arraySize]);

  // Inicializar array al cargar
  useEffect(() => {
    generateRandomArray();
  }, []);

  // Función para esperar durante pausa
  const waitIfPaused = async () => {
    while (pausedRef.current && sortingRef.current) {
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
  };

  // Bubble Sort paso a paso
  const bubbleSort = async () => {
    if (sortingRef.current) return;

    // Cancelar cualquier ordenación anterior
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setSorting(true);
    setPaused(false);
    sortingRef.current = true;
    pausedRef.current = false;
    setSortedIndices(new Set());
    setComparingIndices([]);
    setMaxIndex(null);

    const arr = [...array];
    const n = arr.length;
    const sorted = new Set<number>();

    try {
      for (let i = 0; i < n - 1; i++) {
        // Verificar si se canceló la ordenación
        if (!sortingRef.current || abortControllerRef.current?.signal.aborted) break;

        // Esperar si está pausado
        await waitIfPaused();
        if (!sortingRef.current || abortControllerRef.current?.signal.aborted) break;

        for (let j = 0; j < n - i - 1; j++) {
          // Verificar si se canceló la ordenación
          if (!sortingRef.current || abortControllerRef.current?.signal.aborted) break;

          // Esperar si está pausado
          await waitIfPaused();
          if (!sortingRef.current || abortControllerRef.current?.signal.aborted) break;

          // Determinar cuál es el elemento más grande ANTES de la comparación
          // Si arr[j] > [j + 1], maxIdx será j , si arr[j] < arr[j+1], maxIdx = j+1,  si son iguales, maxIdx = null
          const maxIdx = arr[j] > arr[j + 1] ? j : arr[j] < arr[j + 1] ? j + 1 : null;

          // Marcar barras que se están comparando
          setComparingIndices([j, j + 1]);
          setMaxIndex(maxIdx);

          // Esperar antes de comparar
          await new Promise((resolve) => setTimeout(resolve, speed));
          await waitIfPaused();
          if (!sortingRef.current || abortControllerRef.current?.signal.aborted) break;

          if (arr[j] > arr[j + 1]) {
            // El elemento más grande está en j, se moverá a j+1 después del intercambio
            // Primero actualizar maxIndex para que el elemento más grande siga siendo verde
            setMaxIndex(j + 1);

            // Intercambiar elementos
            [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];

            // Actualizar estado del array (el elemento más grande ahora está en j+1 y es verde)
            setArray([...arr]);

            // Esperar después del intercambio (mostrando el elemento más grande en verde en su nueva posición)
            await new Promise((resolve) => setTimeout(resolve, speed));
            await waitIfPaused();
            if (!sortingRef.current || abortControllerRef.current?.signal.aborted) break;
          }

          // Limpiar comparación
          setComparingIndices([]);
          setMaxIndex(null);
        }
        // Fin for 

        // Marcar el último elemento como ordenado
        sorted.add(n - i - 1);
        setSortedIndices(new Set(sorted));
      }

      // Marcar todos como ordenados al finalizar
      if (sortingRef.current && !abortControllerRef.current?.signal.aborted) {
        const allSorted = new Set(Array.from({ length: n }, (_, i) => i));
        setSortedIndices(allSorted);
        setComparingIndices([]);
        setMaxIndex(null);
      }
    } catch (error) {
      console.error("Error en bubble sort:", error);
    } finally {
      setSorting(false);
      setPaused(false);
      sortingRef.current = false;
      pausedRef.current = false;
    }
  };

  // Pausar ordenación
  const handlePause = () => {
    setPaused(true);
  };

  // Reanudar ordenación
  const handleResume = () => {
    setPaused(false);
  };

  // Reiniciar ordenación
  const handleReset = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setSorting(false);
    setPaused(false);
    sortingRef.current = false;
    pausedRef.current = false;
    if (originalArrayRef.current.length > 0) {
      setArray([...originalArrayRef.current]);
    }
    setSortedIndices(new Set());
    setComparingIndices([]);
    setMaxIndex(null);
  };

  // Obtener color de la barra
  const getBarColor = (index: number): string => {
    // Si está ordenado, siempre verde
    if (sortedIndices.has(index)) {
      return "#4caf50"; // Green - ordenado
    }
    
    // Si está en comparación
    if (comparingIndices.includes(index)) {
      // Si maxIndex es null, significa que ambos son iguales
      if (maxIndex === null) {
        return "#ff9800"; // Orange - ambos son iguales
      }
      // El elemento más grande está en VERDE (prioridad)
      if (maxIndex === index) {
        return "#4caf50"; // Green - el más grande
      }
      // El otro elemento comparado está en ROJO
      return "#f44336"; // Red - comparando
    }
    
    return "#212121"; // Black - base
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: "bold" }}>
        Visualizador de Bubble Sort
      </Typography>

      {/* Controles */}
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Box display="flex" flexWrap="wrap" gap={2} alignItems="center" mb={3}>
          <Button
            variant="outlined"
            startIcon={<ShuffleIcon />}
            onClick={() => generateRandomArray()}
            disabled={sorting}
          >
            Generar nuevo array
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<PlayArrowIcon />}
            onClick={bubbleSort}
            disabled={sorting}
          >
            Iniciar ordenación
          </Button>
          <Button
            variant="outlined"
            color="warning"
            startIcon={<PauseIcon />}
            onClick={handlePause}
            disabled={!sorting || paused}
          >
            Pausar
          </Button>
          <Button
            variant="outlined"
            color="success"
            startIcon={<PlayArrowIcon />}
            onClick={handleResume}
            disabled={!sorting || !paused}
          >
            Reanudar
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<RestartAltIcon />}
            onClick={handleReset}
          >
            Reiniciar
          </Button>
          <Button
            variant="outlined"
            startIcon={showValues ? <VisibilityOffIcon /> : <VisibilityIcon />}
            onClick={() => setShowValues(!showValues)}
          >
            {showValues ? "Ocultar valores" : "Mostrar valores"}
          </Button>
        </Box>

        {/* Slider de tamaño del array */}
        <Box sx={{ px: 2, mb: 3 }}>
          <Typography gutterBottom>
            Tamaño del array: {arraySize} elementos
          </Typography>
          <Slider
            value={arraySize}
            onChange={(_, newValue) => {
              const newSize = newValue as number;
              setArraySize(newSize);
              shouldRegenerateOnSizeChange.current = true;
            }}
            min={20}
            max={130}
            step={5}
            disabled={sorting}
            valueLabelDisplay="auto"
            valueLabelFormat={(value) => `${value}`}
          />
        </Box>

        {/* Slider de velocidad */}
        <Box sx={{ px: 2 }}>
          <Typography gutterBottom>
            Velocidad: {speed}ms por comparación
          </Typography>
          <Slider
            value={speed}
            onChange={(_, newValue) => setSpeed(newValue as number)}
            min={10}
            max={350}
            step={10}
            disabled={sorting}
            valueLabelDisplay="auto"
            valueLabelFormat={(value) => `${value}ms`}
          />
        </Box>
      </Paper>

      {/* Contenedor de barras */}
      <Paper
        elevation={3}
        sx={{
          p: 3,
          backgroundColor: "#f5f5f5",
          borderRadius: 2,
          minHeight: "350px",
        }}
      >
        <Box
          display="flex"
          alignItems="flex-end"
          justifyContent={arraySize < 75 ? "center" : "space-between"}
          gap={0.5}
          sx={{
            height: "350px",
            paddingX: 2,
            paddingY: 2,
            position: "relative",
            width: "100%",
            boxSizing: "border-box",
          }}
        >
          {array.map((value, index) => {
            // Calcular ancho dinámico de las barras según el tamaño del array
            const useFixedWidth = arraySize < 75; // Para arrays pequeños, usar ancho fijo
            const minBarWidth = arraySize > 100 ? 2 : arraySize > 80 ? 3 : arraySize > 75 ? 4 : arraySize > 30 ? 6 : 8;
            const fixedBarWidth = 16; // Ancho fijo para arrays pequeños

            return (
              <Box
                key={`${index}-${value}`}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  position: "relative",
                  flex: useFixedWidth ? "0 0 auto" : "1 1 0",
                  minWidth: useFixedWidth ? `${fixedBarWidth}px` : `${minBarWidth}px`,
                  maxWidth: useFixedWidth ? `${fixedBarWidth}px` : "none",
                }}
              >
                {/* Valor numérico arriba */}
                {showValues && (
                  <Typography
                    variant="caption"
                    sx={{
                      fontSize: arraySize > 60 ? "0.5rem" : "0.6rem",
                      color: "#666",
                      mb: 0.5,
                      minHeight: "14px",
                      lineHeight: 1,
                    }}
                  >
                    {value}
                  </Typography>
                )}
                {/* Barra */}
                <motion.div
                  animate={{
                    height: `${value}px`,
                    backgroundColor: getBarColor(index),
                  }}
                  transition={{ 
                    backgroundColor: { duration: 0 },
                    height: { duration: 0 }
                  }}
                  style={{
                    width: useFixedWidth ? `${fixedBarWidth}px` : "100%",
                    minWidth: useFixedWidth ? `${fixedBarWidth}px` : `${minBarWidth}px`,
                    maxWidth: useFixedWidth ? `${fixedBarWidth}px` : "100%",
                    minHeight: "4px",
                    borderRadius: "2px 2px 0 0",
                    height: `${value}px`,
                  }}
                  title={`Valor: ${value}`}
                />
              </Box>
            );
          })}
        </Box>
      </Paper>

      {/* Información adicional */}
      <Box sx={{ mt: 3, textAlign: "center" }}>
        <Typography variant="body2" color="text.secondary">
          <strong>Leyenda:</strong>{" "}
          <Box component="span" sx={{ color: "#212121" }}>
            Negro
          </Box>{" "}
          = Normal |{" "}
          <Box component="span" sx={{ color: "#f44336" }}>
            Rojo
          </Box>{" "}
          = Comparando |{" "}
          <Box component="span" sx={{ color: "#4caf50" }}>
            Verde
          </Box>{" "}
          = Elemento más grande / Ordenado
        </Typography>
      </Box>
    </Container>
  );
};

export default SortingDemoPage;


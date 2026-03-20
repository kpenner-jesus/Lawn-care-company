import { CanvasProvider } from './state/canvas-context';
import { SodCalculator } from './components/SodCalculator';

export default function App() {
  return (
    <CanvasProvider>
      <SodCalculator />
    </CanvasProvider>
  );
}


import { Routes } from "./src/routes/Routes";
import { Provider } from "react-redux";
import { store } from "./src/store/store";
export default function App() {
  
  //const errorState = useSelector((state)=>state.utils.error)
  //console.log("errorState",errorState)
  const handleRetry = () => {
    // Retry logic here
    console.log("Retrying...");
    setHasError(false); // Example: Reset error state
  };
  return (
    <>
      <Provider store={store}>
          <Routes />
      </Provider>
    </>
  );
}
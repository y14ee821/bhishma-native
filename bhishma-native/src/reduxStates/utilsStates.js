import { useSelector } from "react-redux";

/**
 * Hook to get all utils state
 * @returns {Object} All utils state values
 */
export const useUtilsState = () => {
  const error = useSelector(state => state.utils.error);
  
  return { error };
};

/**
 * Hook to get error state
 * @returns {boolean} error status
 */
export const useError = () => {
  return useSelector(state => state.utils.error);
};

export const useTheme = ()=>
{
  return useSelector(state=>state.utils.theme);
}

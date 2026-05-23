import { useSelector } from "react-redux";

export const useGetCurrentUser = () => {
  
    return useSelector(state => state.auth.user);
  };


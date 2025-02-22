import { Redirect } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect } from "react";
import { router } from "expo-router";

import { auth } from "../config";

const Index = ():JSX.Element => {
    // useEffect(() => {
    //     onAuthStateChanged(auth,(user) => {
    //         if (user!== null ){
    //             router.replace("/mainscreen/Profile")
    //         }
    //     } )
    // },[])
    
    return <Redirect href="/mainscreen/FooterNavigation" />
}

export default Index
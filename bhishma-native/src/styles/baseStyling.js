import { StyleSheet, Platform } from 'react-native';

let topSpace = 0
if(Platform.OS === 'ios'){
    topSpace = 40
}
else if(Platform.OS === 'android')
{
    topSpace = 0
} 
else
{
    topSpace = 0
}
export const BaseStyle = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: topSpace
  },
  light: {
    backgroundColor: '#b8cce0ff',
  },
  dark: {
    backgroundColor: '#181a20',
  },
  navBarGradient: {
    borderRadius: 10,
    marginBottom: 18,
    elevation: 2,
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 10,
    marginBottom: 0,
    elevation: 0,
  },
  appNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  appName: {
    fontSize: 22,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginLeft: 6,
  },
  navLinks: {
    flexDirection: 'row',
    gap: 18,
  },
  navLink: {
    fontSize: 17,
    fontWeight: '500',
    marginHorizontal: 8,
  },
  navLinkActive: {
    color: '#007AFF',
    textDecorationLine: 'underline',
  },
  header: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#222',
    letterSpacing: 1,
    textAlign: 'center',
  },
  summary: {
    flexDirection: 'column',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    gap: 12,
  },
  summaryText: {
    fontSize: 18,
    color: '#444',
  },
  count: {
    fontWeight: 'bold',
    color: '#007AFF',
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    shadowColor: '#007AFF',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  headerContainer: {
    margin: 20,
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  }
});


export const lightTheme = {
  gradient: ["#9b23ebff", "#ab63eeff", "#9b23ebff"],
  card: {
    backgroundColor: "#fff",
    borderColor: "#e5e7eb",
    borderWidth: 1,
    shadowColor: "#007AFF",
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    color: "#007AFF",
    textShadowColor: "#e3eafc",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  button: {
    backgroundColor: "#00ffd57e",
  },
  buttonText: {
    color: "#33fd00ff",
  },
  addButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    margin: 10,
    alignItems: "center",
    justifyContent: "center",
    
    borderWidth: 2,
    borderColor: "#60219bff",
    borderRadius: 8, // for rounded corners
    borderTopWidth: 1,

  },
  addButtonText: {
    fontWeight: "bold",
    fontSize: 18,
    letterSpacing: 0.8,
    textAlign: "center",
    color: "white",
  },

  greeting: {
    fontSize: 28,
    fontWeight: "bold",
    //color: colors.text,
    color:"greenyellow",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color:"white",
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  statCard: {
    borderRadius: 12,
    padding: 16,
    flex: 1,
    marginHorizontal: 4,
    alignItems: "center",
     borderWidth: 2,
    borderColor: "#60219bff",
    borderRadius: 8, // for rounded corners
    borderTopWidth: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    //color: colors.primary,
    color: "white",
    marginBottom: 4,
  },
  appName:{
        fontSize: 28,
    fontWeight: "bold",
    //color: colors.text,
    color:"white",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: Platform.OS === "web" ? 20 : 12,
    color: "white",


    //color: colors.textSecondary,
  },
  floatingButton: {
    position: "absolute",
    bottom: 30,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    //backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    //shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  themeToggle: {
    position: "absolute",
    top: 60,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    //backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    //shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
};

export const darkTheme = {
    gradient: ['#010102ff', '#000208ff', '#181a20'],
    card: {
        backgroundColor: '#23262f',
        borderColor: '#333',
        borderWidth: 1,
        shadowColor: '#fff',
        shadowOpacity: 0.18,
        shadowRadius: 8,
        elevation: 4,
    },
    header: {
        color: '#fff',
        textShadowColor: '#23262f',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 6,
    },
    button: {
        backgroundColor: 'black',
    },
    buttonText: {
        color: '#fff',
    },
     addButton: {
            paddingVertical: 14,
            paddingHorizontal: 32,
            borderRadius: 12,
            shadowOpacity: 0.25,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 4 },
            marginTop: 10,
            marginBottom: 10,
            elevation: 4,
                 borderWidth: 2,
    borderColor: "#60219bff",
    borderRadius: 8, // for rounded corners
    borderTopWidth: 1,
        },
        addButtonText: {
            fontWeight: 'bold',
            fontSize: 18,
            letterSpacing: 0.8,
            textAlign: 'center',
                    color: "#53b4ecff",
        },
        
       
        greeting: {
            fontSize: 28,
            fontWeight: 'bold',
            color: "#7462cf",
            marginBottom: 4,
        },
        subtitle: {
            fontSize: 16,
            color: "#b2a5f1ff",
            marginBottom: 20,
        },
        statsContainer: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 20,
        },
        statCard: {
            //backgroundColor: colors.surface,
            borderRadius: 12,
            padding: 16,
            flex: 1,
            marginHorizontal: 4,
            alignItems: 'center',
            borderColor: "white",
     borderWidth: 2,
    borderColor: "#60219bff",
    borderRadius: 8, // for rounded corners
    borderTopWidth: 1,            
        },
        statNumber: {
            fontSize: 24,
            fontWeight: 'bold',
            color: "#53b4ecff",
            marginBottom: 4,
        },
        statLabel: {
            fontSize: Platform.OS === "web" ? 20 : 12,
            color: "#b2a5f1ff",
        },
        floatingButton: {
            position: 'absolute',
            bottom: 30,
            right: 20,
            width: 56,
            height: 56,
            borderRadius: 28,
            //backgroundColor: colors.primary,
            alignItems: 'center',
            justifyContent: 'center',
            //shadowColor: colors.primary,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8,
        },
        themeToggle: {
            position: 'absolute',
            top: 60,
            right: 20,
            width: 40,
            height: 40,
            borderRadius: 20,
            //backgroundColor: colors.surface,
            alignItems: 'center',
            justifyContent: 'center',
            //shadowColor: colors.shadow,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 4,
            elevation: 4,
        },
};
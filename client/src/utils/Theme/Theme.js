import { createMuiTheme } from '@material-ui/core/styles';

const theme = createMuiTheme({
	palette: {
	  primary: {
		light: '#819ca9',
		main: '#546e7a',
		dark: '#29434e',
		
	  },
	  secondary: {
		light: '#ffff6b',
		main: '#fdd835',
		dark: '#c6a700',
		
	  },
	  contrastThreshold: 3,
	  tonalOffset: 0.2,
	},
  });

  export default theme;
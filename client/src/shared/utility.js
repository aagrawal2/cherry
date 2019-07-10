import BofaLogo from '../images/bofa.jpg';
import CitiLogo from '../images/citi.jpg';
import AmexLogo from '../images/amex.jpg';
import ComcastLogo from '../images/comcast.jpg';
import FirstTechLogo from '../images/firsttech.jpg';
import WellsFargoLogo from '../images/wellsfargo.jpg';

export const getProviderLogo = providerName => {
    switch (providerName) {
        case 'bofa':
            return BofaLogo;
        case 'citi':
            return CitiLogo;
        case 'amex':
            return AmexLogo;
        case 'fcu':
            return FirstTechLogo;
        case 'wf':
            return WellsFargoLogo;
        case 'comcast':
            return ComcastLogo;
        default:
            return;
    };
};

//check for null, undefined, empty, space String
export const stringNullEmptySpace = (str) => (!str || str.length === 0 || /^\s*$/.test(str));
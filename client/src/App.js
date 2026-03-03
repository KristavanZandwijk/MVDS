import React, { useMemo } from 'react';
import { Routes, Route, Navigate, BrowserRouter } from 'react-router-dom';
import { CssBaseline, ThemeProvider } from '@mui/material';
import {createTheme} from "@mui/material/styles";
import {themeSettings} from "./theme.js"
import { useSelector } from 'react-redux';
import Layout from './scenes/layout/index.jsx';
import Homepage from './scenes/Homepage/index.jsx';
import DataProvider from './scenes/DataProvider/index.jsx';
import Broker from './scenes/Broker/Broker.jsx';
import VocabularyHub from './scenes/VocabularyHub/index.jsx';
import Observer from './scenes/Observer/index.jsx';
import Store from './scenes/Store/index.jsx';
import IdentityProvider from './scenes/IdentityProvider/index.jsx';
import Offer from 'scenes/DataProvider/Offer.jsx';
import Representation from 'scenes/DataProvider/Representation.jsx';
import Contract from 'scenes/DataProvider/Contract.jsx';
import Catalog from 'scenes/DataProvider/Catalog.jsx';
import Artifact from 'scenes/DataProvider/Artifact.jsx';
import DataConsumer from 'scenes/DataConsumer/index.jsx';

function App() {
  const mode = useSelector((state) => state.global.mode);
  const theme = useMemo(() => createTheme(themeSettings(mode)), [mode]);

  return (
  <div className = "app">
    <BrowserRouter>
    <ThemeProvider theme={theme} >
      <CssBaseline />
      <Routes>
        <Route element={<Layout/>}>
            <Route path="/" element={<Navigate to="/homepage" replace />} />
            <Route path="/homepage" element={<Homepage />} />
            <Route path="/dataprovider" element={<DataProvider />} />
            <Route path="/dataprovider/Catalog" element={<Catalog />} />
            <Route path="/dataprovider/Contract" element={<Contract />} />
            <Route path="/dataprovider/representation" element={<Representation />} />
            <Route path="/dataprovider/artifact" element={<Artifact />} />
            <Route path="/dataprovider/offer" element={<Offer />} />
            <Route path="/dataconsumer" element={<DataConsumer/>} />

            <Route path="/broker" element={<Broker />} />

            <Route path="/vocabularyhub" element={<VocabularyHub />} />
            <Route path="/observer" element={<Observer />} />
            <Route path="/store" element={<Store />} />
            <Route path="/identityprovider" element={<IdentityProvider/>} />
        </Route>
      </Routes>
    </ThemeProvider>
    </BrowserRouter>
  </div>
  );
}

export default App;

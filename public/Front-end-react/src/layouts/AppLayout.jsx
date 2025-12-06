import AppHeader from '../components/header/AppHeader';
import './AppLayout.css';

function AppLayout({ children }) {
    return (
        <div className="app-layout">
            <AppHeader />
            <main className="app-main">
                {children}
            </main>
        </div>
    );
}

export default AppLayout;

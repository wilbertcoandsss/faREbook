import './App.css';
// import UserList from './components/UserList';
import { BrowserRouter as Router, Routes, Route, BrowserRouter } from "react-router-dom";
import Login from './pages/auth/login';
import Register from './pages/auth/register';
import Verification from './pages/auth/verification';
import ForgotAcc from './pages/auth/forgotacc';
import ResetPw from './pages/auth/resetpw';
import Home from './pages/home';
import Friends from './pages/friends/friends';
import Group from './pages/group/group';
import Messenger from './pages/messenger/messenger';
import Notif from './pages/notif';
import StoriesPage from './pages/stories/stories';
import CreateStories from './pages/stories/createstories';
import CreatePhoto from './pages/stories/createphoto';
import CreateText from './pages/stories/createtext';
import ReelsPage from './pages/reels/reels';
import CreateReels from './pages/reels/createreels';
import Search from './pages/search';
import Profile from './pages/profile';
import CreateGroup from './pages/group/creategroup';
import GroupProfile from './pages/group/groupprofile';

function App() {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/friends" element={<Friends />}></Route>
          <Route path="/group" element={<Group />}></Route>
          <Route path="/notification" element={<Notif />}></Route>
          <Route path="/messenger" element={<Messenger />}></Route>
          <Route path="/login" element={<Login></Login>}></Route>
          <Route path="/register" element={<Register></Register>}></Route>
          <Route path="/verification/:id" element={<Verification />}></Route>
          <Route path="/forgotAcc" element={<ForgotAcc />}></Route>
          <Route path="/resetPw/:id" element={<ResetPw />}></Route>
          <Route path="/stories" element={<StoriesPage />} />
          <Route path="/createstories" element={<CreateStories />} />
          <Route path='/createphoto' element={<CreatePhoto />} />
          <Route path="/createtext" element={<CreateText />} />
          <Route path="/reels" element={<ReelsPage />} />
          <Route path="/createreels" element={<CreateReels />} />
          <Route path="/search/:query" element={<Search />} />
          <Route path="/profile">
            <Route path=":id" element={<Profile />}></Route>
          </Route>
          <Route path="/creategroup" element={<CreateGroup />}></Route>
          <Route path="/groupprofile/:id" element={<GroupProfile />}></Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
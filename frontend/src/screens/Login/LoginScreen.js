import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  Dimensions,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';

// styled-components
import styled from 'styled-components/native';

// kakao symbol - svg
import { WithLocalSvg } from 'react-native-svg';
import kakaoSymbol from '@/assets/images/Kakao_symbol.svg';

// 카카오 로그인 활용하기
import {
  KakaoOAuthToken,
  KakaoProfile,
  getProfile as getKakaoProfile,
  login,
  logout,
  unlink,
  // 엑세스 토큰 정보
  getAccessToken as getKakaoAccessToken,
  KakaoAccessTokenInfo,
} from '@react-native-seoul/kakao-login';

// axios
import axios from 'axios';

/*
// 카카오 로그인
const signInWithKakao = async () => {
  const token: KakaoOAuthToken = await login();

  setResult(JSON.stringify(token));
};
// 카카오 로그아웃
const signOutWithKakao = async () => {
  const message = await logout();

  setKakaoInfo({
    token: null,
    profile: null,
  });
  setKakaoAccessTokenInfo(null);
};
// 카카오 프로필 조회
const getProfile = async () => {
  const profile: KakaoProfile = await getKakaoProfile();

  setResult(JSON.stringify(profile));
};
// 카카오 연결 끊기
const unlinkKakao = async () => {
  const message = await unlink();

  setKakaoInfo({
    token: null,
    profile: null,
  });

  setKakaoAccessTokenInfo(null);
};
// 카카오 엑세스 토큰 정보 조회
const getAccessTokenInfo = async () => {
  try {
    const accessTokenInfo: KakaoAccessTokenInfo = await getKakaoAccessToken();
    setKakaoAccessTokenInfo((prev) => {
      prev = { ...kakaoAccessTokenInfo, accessTokenInfo }
      console.log('가지고 있는 엑세스 토큰 정보', prev)
      return prev
    })
  } catch (e) {
    console.log('엑세스 토큰 정보 조회 에러 발생')
    console.error(e)
  }
};
*/
// AsyncStorage
import AsyncStorage from '@react-native-community/async-storage';
import { configs } from 'eslint-plugin-prettier';

function LoginPage({ navigation }) {

  // 카카오 정보 조회
  const [kakaoInfo, setKakaoInfo] = useState({
    token: null,
    profile: null,
  });
  // 카카오 연결 끊기
  const unlinkKakao = async () => {
    const message = await unlink();
  };
  // 1. 토큰 발급
  const accessKakaoToken = async () => {
    try {
      const token: KakaoOAuthToken = await login();
      await setKakaoInfo((prev) => {
        console.log({ ...kakaoInfo }, 'destructure')
        prev = { ...kakaoInfo, token: token }
        console.log('받은 토큰 정보', prev)
        return prev
      });
    } catch (e) {
      console.log('카카오 토큰 발급 실패')
      console.error(e)
      showAlert("카카오 토큰 발급 실패")
    }
  };
  // 2. 프로필 조회
  const kakaoProfile = async () => {
    try {
      const profile: KakaoProfile = await getKakaoProfile();
      setKakaoInfo((prev) => {
        // 들어온 인자(이전의 state - kakaoInfo)
        prev = { ...prev, profile: profile }
        console.log('받은 프로필 정보', prev)
        return prev
      });
      // 3번 함수 실행의 인자로 넘겨주기
      profile.id = '12345'
      return profile
    } catch (e) {
      console.log('카카오 프로필 조회 실패')
      console.error(e)
      showAlert("카카오 프로필 조회 실패")
    }
  };
  // 3. JWT token API
  const getJWTToken = async (kakaoprofile) => {
    try {
      let url = 'http://k4c105.p.ssafy.io:8080/api/user';
      let options = {
        method: 'POST',
        url: url,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json;charset=UTF-8'
        },
        data: JSON.stringify(kakaoprofile)
      };
      // request 보낼 정보 확인(카카오 프로필 정보)
      console.log(options);
      let response = await axios(options);
      // 받은 토큰, 접속 상태, 사용자 정보 업데이트
      console.log('response');
      console.log(response);
      // 3 - 1. AsyncStorage 저장하기 및 이동
      saveUserInfo(response.data)
    } catch (e) {
      console.error(e)
      showAlert("JWT token 발급 실패")
    }
  };

  // 3 - 1. AsyncStorage 저장하기
  const saveUserInfo = (data) => {
    // JWT token
    // 1. asyncstorage에 있는 토큰 정보 초기화
    AsyncStorage.removeItem('JWT');
    // 2. asyncstorage에 넣어주기
    AsyncStorage.setItem('JWT', data.token);
    // 3. 조회해서 확인
    AsyncStorage.getItem('JWT', (error, JWTValue) => {
      console.log('접속자 토큰정보', JWTValue)
    });
    // 모드 정보
    // 1. asyncstorage에 있는 모드 정보 초기화
    AsyncStorage.removeItem('mode');
    // 2. asyncstorage에 넣어주기
    AsyncStorage.setItem('mode', data.user.profile.mode);
    // 3. 조회해서 확인
    AsyncStorage.getItem('mode', (error, mode) => {
      console.log('접속자 mode 정보', mode)
    });

    // 이동하기 - 에러 처리
    if (data.msg === 'login') {
      navigation.navigate("Home")
    } else if (data.msg === 'signup') {
      // props 넘기기
      navigation.navigate("SelectMode", data.user.profile)
    }
  };

  // 실제 로그인
  const roufarmLogin = async () => {
    // 1. 토큰 발급
    await accessKakaoToken()
    // 2. 프로필 조회 => return 값 넣어주기
    // 3. JWT token API
    await getJWTToken(await kakaoProfile())
  };

  // RN - BE 통신 테스트 (회원 가입 조회 - 정보 가져오기)
  const testGet = async () => {
    try {
      let url = 'http://k4c105.p.ssafy.io:8080/api/user/';
      let options = {
        method: 'GET',
        url: url,
        headers: {
          // body가 없기 때문에 accept, content-type X
          // 헤더에 JWT 추가
          'Authorization': JWT,
        },
      };
      console.log(options, '옵션')
      let response = await axios(options);
      // 테스트용 조회
      setGetUser(JSON.stringify(response.data))
      console.log('response - get(user/)')
      console.log(response)
    } catch (e) {
      console.error(e);
    }
  };

  // alert 창 실패 시 메세지 담아서
  const showAlert = (msg) => {
    Alert.alert(
      "버튼을 다시 클릭해주세요",
      msg
    );
  }

  // RN - BE 통신 테스트 (회원 닉네임 변경 - 정보 가져오기)
  const testPut = async () => {
    try {
      let url = 'http://k4c105.p.ssafy.io:8080/api/user/';
      let options = {
        method: 'PUT',
        url: url,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json;charset=UTF-8',
          // 헤더에 JWT 추가
          'Authorization': JWT,
        },
        data: {
          nickname: '나야',
          mode: '너야?'
        }
      };
      console.log(options, '옵션')
      let response = await axios(options);
      console.log('response - put(user/)')
      console.log(response)
    } catch (e) {
      console.error(e);
    }
  };


  return (
    <Wrapper>
      {/* App name */}
      <Content1>
        <AppName>Rou
            <Text style={{ color: '#55f27c' }}>Farm</Text>
        </AppName>
        <Subtitle>부지런한 농부의 마음으로 시작하는 루틴 관리</Subtitle>
      </Content1>
      <Content2>
        {/* App Logo */}
        <Logo
          resizeMode={'contain'}
          source={require('../../assets/images/slave1.png')}></Logo>
        {/* kakao login btn */}
        <Btn onPress={() => roufarmLogin()}>
          <WithLocalSvg
            asset={kakaoSymbol}
            width={15}
            height={20}
            fill={'#000000'} />
          <BtnText>카카오 로그인</BtnText>
        </Btn>
        {/* 이동 메인 */}
        <Btn onPress={() => unlinkKakao()}>
          <WithLocalSvg
            asset={kakaoSymbol}
            width={15}
            height={20}
            fill={'#000000'} />
          <BtnText>카카오 로그인</BtnText>
        </Btn>
        <Btn onPress={() => navigation.navigate('SelectMode')}>
          <WithLocalSvg
            asset={kakaoSymbol}
            width={15}
            height={20}
            fill={'#000000'} />
          <BtnText>카카오 로그인</BtnText>
        </Btn>
      </Content2>
    </Wrapper >
  );
}

// 메인 배경
const Wrapper = styled.View`
  flex:1;
  background: #f4f4f4;
`;

// 각 섹션
const Content1 = styled.View`
  flex: 1;
  justify-content: flex-end;
  align-items: center;
`;
const AppName = styled.Text`
  color: white;
  font-size: 40px;
  font-family: "SHOWG";
  color: #fcc004;
  margin-bottom: 4px;
`;
const Subtitle = styled.Text`
  align-self: center;
  font-size: 12px;
  font-family: "NotoSansKR-Regular";
  color: #606c80;
`;

// 중앙 - 설명, 로고
const Content2 = styled.View`
  flex: 2;
  align-items: center;
  justify-content: flex-start;
  margin: 20px;
  margin-top: 40px;
`;
const Logo = styled.Image`
`;
// 카카오 로그인 - 규칙에 따라
const Btn = styled.TouchableOpacity`
  flex-direction: row;
  justify-content: center;
  align-content: space-between;
  margin-top: 40px;
  background: #fee500;
  padding: 15px;
  border-radius: 12px;
  width: 250px;
`;
const Symbol = styled.View`
  width: 5px;
  height: 5px;
`;
const BtnText = styled.Text`
  margin-left: 15px;
  color: #0f0f0f;
`;

export default LoginPage;
/**
 * [Game Engine v3.0]
 * - 플래그(Flag) 기반의 정교한 분기 시스템
 * - 확률(Probability) 시스템 추가
 * - 태그(뱃지) 도감 자동 관리
 */

// 전역 데이터 저장소
window.SCENARIO_DATA = window.SCENARIO_DATA || [];
window.TAG_DICTIONARY = {}; // 태그 설명 모음

// 스테이지 찾기
window.findStage = function(stageId) {
    return window.SCENARIO_DATA.find(s => s.id === stageId);
};

// ★ 핵심: 선택 결과 계산기
window.calculateResult = function(playerData, choice) {
    // 1. 데이터 복사 (원본 보존)
    let newHp = playerData.hp || 100;
    let newStress = playerData.stress || 0;
    let newTags = [...(playerData.tags || [])];
    
    // 아이템과 상태도 변수에 담아서 처리
    let newItem = playerData.item || "없음";
    let newState = playerData.state || "양호";
    
    let resultText = choice.resultText || "";
    
    // 2. 확률 체크
    let isSuccess = true;
    if (choice.prob) {
        const randomVal = Math.random() * 100;
        if (randomVal > choice.prob) {
            isSuccess = false;
            resultText = choice.failText || "❌ 운이 따르지 않았습니다...";
            newStress += 10;
        }
    }

    if (isSuccess) {
        // 성공 시 효과 적용
        newHp += (choice.hp || 0);
        newStress += (choice.stress || 0);
        
        // 플래그 추가
        if (choice.addFlag && !newTags.includes(choice.addFlag)) {
            newTags.push(choice.addFlag);
        }
        // 플래그 제거
        if (choice.removeFlag) {
            newTags = newTags.filter(t => t !== choice.removeFlag);
        }
        
        // 아이템/상태 변경 (선택지에 명시된 경우 반영)
        if (choice.item) newItem = choice.item;
        if (choice.state) newState = choice.state;
        
        // (호환성 유지)
        if (choice.setItem) newItem = choice.setItem;
        if (choice.setState) newState = choice.setState;
    }

    // 3. 범위 제한
    if(newHp > 100) newHp = 100;
    if(newHp < 0) newHp = 0;
    if(newStress < 0) newStress = 0;

    // ★ [수정됨] 체력과 스트레스 구간에 따른 상태(State) 자동 판별
    // 수치에 따라 상태를 덮어씌웁니다. (위급한 상태 우선)
    
    // 1순위: 생명 관련 (체력)
    if (newHp <= 0) {
        newState = "사망";
    } else if (newHp <= 20) {
        newState = "위독";
    } 
    // 2순위: 정신 관련 (스트레스) - 체력이 위독하지 않을 때만 체크
    else if (newStress >= 90) {
        newState = "공황";
    } else if (newHp <= 50) {
        newState = "부상";
    } else if (newStress >= 60) {
        newState = "불안";
    } else {
        // 특별한 수치 이상이 없으면 '양호'로 돌아옴
        // (단, 기존 상태가 특수 상태인 경우 유지가 필요할 수 있으나, 요청하신 대로 수치 기반 변동에 집중함)
        // 수치상 문제가 없으면 기본 상태 '양호'
        newState = "양호";
    }

    return {
        hp: newHp,
        stress: newStress,
        tags: newTags,
        item: newItem,   // 수정된 아이템 반환
        state: newState, // 구간에 따라 자동 변경된 상태 반환
        text: resultText,
        isSuccess: isSuccess
    };
};

console.log("✅ Ultimate Game Engine Loaded.");
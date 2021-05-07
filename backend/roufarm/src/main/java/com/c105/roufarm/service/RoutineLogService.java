package com.c105.roufarm.service;

import java.util.ArrayList;
import java.util.List;

import com.c105.roufarm.model.RoutineLog;
import com.c105.roufarm.repository.RoutineLogMongoDBRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class RoutineLogService {
      @Autowired
      RoutineLogMongoDBRepository routineLogMongoDBRepository;


      // 1. 루틴 id로 루틴 로그 검색
      @Transactional
      public RoutineLog findRoutineLog(String id){
            return routineLogMongoDBRepository.findById(id).get();
      }
      
      // 2. 루틴아이디 리스트에 해당하는 루틴로그들 리스트 가져오기
      @Transactional
      public List<RoutineLog> findRoutineLogList(List<String> routineLogIds){
           List<RoutineLog> routineLogList = new ArrayList<RoutineLog>();
           for(String logId : routineLogIds){
                  RoutineLog routineLog = routineLogMongoDBRepository.findById(logId).get();
                  routineLogList.add(routineLog);
           }
           return routineLogList;
      }

      // 3. 루틴로그 생성 (루틴 로그와)
      @Transactional
      public RoutineLog saveRoutineLog(RoutineLog routineLog){
            routineLogMongoDBRepository.save(routineLog);
            return routineLogMongoDBRepository.findById(routineLog.getId()).get();
      }

}
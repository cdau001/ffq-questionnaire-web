/*

  Added by Javier Romero, edited by Khalid Alamoudi
  This is the recommendations page for the clinician portal (clinic/recommend).
  From here, the clinician can see all the recommended nutrients for all parents assigned to the clinic.

*/

import { Component, OnInit } from '@angular/core';
import { ResultsService } from 'src/app/services/results/results';
import { FFQResultsResponse } from 'src/app/models/ffqresultsresponse';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { RecommendModalComponent } from 'src/app/components/recommend-modal/recommend-modal.component';
import { MatDialog } from '@angular/material';
import { NutrientsRecommendationsService } from 'src/app/services/nutrients-recommendations/nutrients-recommendations.service';
import { FFQNutrientsRecommendations } from 'src/app/models/ffqnutrients-recommendations';
import { ErrorDialogPopupComponent } from 'src/app/components/error-dialog-popup/error-dialog-popup.component';
import { Router } from '@angular/router';
import { FoodRecommendModalComponent } from 'src/app/components/food-recommend-modal/food-recommend-modal.component';
import { FoodRecommendationsService } from 'src/app/services/food-recommendation-service/food-recommendations.service';
import { FFQParent } from 'src/app/models/ffqparent';
import { FFQClinicResponse } from 'src/app/models/ffqclinic-response';
import { ClinicService } from 'src/app/services/clinic/clinic-service';
import { ParentService } from 'src/app/services/parent/parent-service';
import { AuthenticationService } from 'src/app/services/authentication/authentication.service';
import { Observable, of } from 'rxjs';
import { FFQParentResponse } from 'src/app/models/ffqparent-response';
import { FFQParentResult } from 'src/app/models/ffqparentresult';


@Component({
  selector: 'app-recommend',
  templateUrl: './clinic-recommend.component.html',
  styleUrls: ['./clinic-recommend.component.css']
})
export class ClinicRecommendComponent implements OnInit {
  private results: FFQResultsResponse[] = [];
  private parentList: FFQParent[] = [];
  private clinicId: string;
  private resultList: FFQResultsResponse[] = [];
  private currentClinicName: string;
  private parentNames: string[] = [];
  resultMap: Map<string, FFQParentResult> = new Map<string, FFQParentResult>();
  resultInfo: FFQParentResult[] = [];
  search: string;

  constructor(
    public resultsService: ResultsService,
    public nutrientsRecommendationsService: NutrientsRecommendationsService,
    public foodRecommendationsService: FoodRecommendationsService,
    public clinicService: ClinicService,
    public parentService: ParentService,
    public authenticationService: AuthenticationService,
    private errorDialog: MatDialog,
    private router: Router, ) { }

  ngOnInit() {
    this.getClinicId();
  }

  private getNutrientsRecommendations(questionnaireId: string) {
    this.nutrientsRecommendationsService.getNutrientsRecommendationsByQuestionnaireId(questionnaireId).subscribe(
      data => {
        this.onModalRequest(questionnaireId);
      },
      error => {
        const dialogRef = this.errorDialog.open(ErrorDialogPopupComponent);
        dialogRef.componentInstance.title = error.error.message;
        dialogRef.componentInstance.router = this.router;
      }
    );
  }

  private getFoodRecommendations(questionnaireId: string) {
    this.foodRecommendationsService.getFoodRecommendationsByQuestionnaireId(questionnaireId).subscribe(
      data => {
        this.onModalRequestFood(questionnaireId);
      },
      error => {
        const dialogRef = this.errorDialog.open(ErrorDialogPopupComponent);
        dialogRef.componentInstance.title = error.error.message;
        dialogRef.componentInstance.router = this.router;
      }
    );
  }



  /*private getAllResults() {
    this.resultsService.getAllResults().subscribe(data => {
      data.map(response => {
        this.results.push(response);
      });
    });
  }*/

  private loadData(){

     const resultListObservable: Observable<FFQResultsResponse[]> = of(this.resultList);

     resultListObservable.subscribe(resultList => {

        this.resultList = resultList.reverse();
        this.parentNames = this.parentNames.reverse();
        //console.log("results in loadData")
        //console.log(this.resultList)
        for(var i = 0; i < this.resultList.length; i++){
          //console.log(i)
        // this.allParentName.set(this.results[i].userId, this.parentNames[i]);
          var object: FFQParentResult = new FFQParentResult(
            this.resultList[i],
            this.parentNames[i]
          );
          this.resultInfo.push(object);
          this.resultMap.set(this.resultList[i].userId, object);
        }
        //console.log("resultInfo in function");
        //console.log(this.resultInfo);
    })

  }

  private getClinicId(){

    var clinicListObervable: Observable<FFQClinicResponse[]> = this.clinicService.getAllClinics();
    const loggedInUser = this.authenticationService.currentUserValue;
    var clinicId: string;

    console.log("Logged in user clinic: " + loggedInUser[0].assignedclinic);
    clinicListObervable.subscribe(clinicList => {
      var clinic = clinicList.find(a => a.clinicId == loggedInUser[0].assignedclinic);
      if(clinic){
        this.clinicId = clinic.clinicId;
        this.currentClinicName = clinic.clinicname;
        //console.log("clinic ID in function");
        //console.log(this.clinicId);
      }
      this.getParentList();
    });

  }

  private getParentList(){
    var parentListObervable: Observable<FFQParentResponse[]> = this.parentService.getAllParents();
  
    parentListObervable.subscribe(parentList => {
       parentList.forEach(parent => {
        // this.allParentNames.push(parent.firstname + " " + parent.lastname);
         if(parent.assignedclinic == this.clinicId){
         //  this.allParentName.set(parent.userId, parent);
           this.parentList.push(parent);
         }
       })
       this.getResultsList();
  
       console.log(this.parentList);
    });

  }
private getResultsList(){
  console.log("Parents in Get result");
  console.log(this.parentList);
  
  var allResultsObservable: Observable<FFQResultsResponse[]> = this.resultsService.getAllResults();
  allResultsObservable.subscribe((allResults: FFQResultsResponse[]) => {
   console.log("All REsults in function");
   console.log(allResults);
     this.parentList.forEach(parent => { 
         allResults.forEach(result => {
             if(result.userId == parent.userId){
               this.resultList.push(result);
               var parentName = parent.firstname + " " + parent.lastname;
               this.parentNames.push(parentName);
             }
         });
         console.log("parentNames for this parent")
         console.log(this.parentNames);
     });
     console.log("results in function");
     console.log(this.resultList);
     this.loadData();
  });

}


  onModalRequest(id: string): void {
    const modalRef = this.errorDialog.open(RecommendModalComponent);
    modalRef.componentInstance.id = id;
  }

  onModalRequestFood(id: string): void {
    const modalRef = this.errorDialog.open(FoodRecommendModalComponent);
    modalRef.componentInstance.id = id;
  }

}
/*

  Added by Ver 2.0 group, edited by Javier Romero to make it look more consistent with the rest of the pages.
  This is the first page of the resarch portal (research/home).
  Here you can see a list of all the food items in the database.
  The admin can create, edit or delete food items in this page.

*/

import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { MatDialog } from "@angular/material/dialog";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { ResearcherParentService } from "../../services/researcher-parent/researcher-parent-service";
import { HttpErrorResponse } from "@angular/common/http";
import { ErrorDialogPopupComponent } from "src/app/components/error-dialog-popup/error-dialog-popup.component";
import { FlashMessagesService } from "angular2-flash-messages";
import { HttpClient } from "@angular/common/http";
import { environment } from "src/environments/environment";
import { CreateParticipantModalComponent} from "src/app/components/create-participant-modal/create-participant-modal.component"
import { FFQResearcher } from "src/app/models/ffqresearcher";
import { FfqParticipant } from 'src/app/models/ffq-participant';
import { InstitutionService } from 'src/app/services/institution/institution-service';


@Component({
  selector: "app-questionnaire-page",
  templateUrl: "./research-users.component.html",
  styleUrls: ["./research-users.component.css"],
})
export class ResearchUsersComponent implements OnInit {

  TITLE = "FFQR Research Portal";
  endpoint = environment.foodServiceUrl + "/ffq";

  currentUser = <FFQResearcher>JSON.parse(localStorage.getItem('currentUser'))[0];
  institutionAttributes: object;
  participants: FfqParticipant[] = [];
  dataLoaded: Promise<boolean>;

  constructor(
    public researchParentService: ResearcherParentService,
    public institutionService: InstitutionService,
    private activatedRoute: ActivatedRoute,
    private errorDialog: MatDialog,
    private submissionErrorDialog: MatDialog,
    private httpErrorDialog: MatDialog,
    private successDialog: MatDialog,
    private router: Router,
    private modalService: NgbModal,
    private flashMessage: FlashMessagesService,
    private http: HttpClient
  ) {
  }


  ngOnInit() {
    this.findAllParticipants();
    this.getInstitutionById(this.currentUser.assignedResearchInstitutionId);
  }

  onOpenCreateParticipantModal(): void {
    let remainingParticipants = this.currentUser.limitNumberOfParticipants - this.participants.length;
    localStorage.setItem("remainingParticipants", remainingParticipants.toString());
    const modalRef = this.modalService.open(CreateParticipantModalComponent);
  }

  private handleFoodServiceError(error: HttpErrorResponse) {
    console.error("Error occurred.\n" + error.message);
    const dialogRef = this.errorDialog.open(ErrorDialogPopupComponent);
    dialogRef.componentInstance.title = "Error Fetching Food Items";
    dialogRef.componentInstance.message = error.message;
    dialogRef.componentInstance.router = this.router;
    dialogRef.afterClosed().subscribe(() => {
      this.router.navigateByUrl("/");
    });
  }

  private findAllParticipants() {
    this.researchParentService.getAllParticipants(this.currentUser.assignedResearchInstitutionId).subscribe(
      (data) => {
        data.map((response) => {
          if (response.assignedResearcherUsers[0] === this.currentUser.userId) {
            this.participants.push(response);
          }
        });
        console.log(this.participants);

        this.dataLoaded = Promise.resolve(true);
      },
      (error: HttpErrorResponse) => this.handleFoodServiceError(error)
    );
  }

  private getInstitutionById(id: string)
  {
      this.institutionService.getInstitution(id).subscribe(data => {
       this.institutionAttributes = data;
      });
      this.dataLoaded = Promise.resolve(true);
  }
}

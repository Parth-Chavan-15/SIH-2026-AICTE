/** Proposed path ownership; prepend /api/v1. */
export const paths={
 authLogin:'/auth/login',authLogout:'/auth/logout',authMe:'/auth/me',
 applications:'/applications',application:(id:string)=>`/applications/${encodeURIComponent(id)}`,
 explanation:(id:string)=>`/applications/${encodeURIComponent(id)}/explanation`,
 transition:(id:string)=>`/applications/${encodeURIComponent(id)}/transition`,
 scrutiny:(id:string)=>`/applications/${encodeURIComponent(id)}/scrutiny`,
 corrections:(id:string)=>`/applications/${encodeURIComponent(id)}/corrections`,
 rescrutiny:(id:string)=>`/applications/${encodeURIComponent(id)}/rescrutiny`,
 evcQueue:'/evc/queue',evcSchedule:(id:string)=>`/evc/${encodeURIComponent(id)}/schedule`,evcReport:(id:string)=>`/evc/${encodeURIComponent(id)}/report`,
 decision:(id:string)=>`/applications/${encodeURIComponent(id)}/decisions`,
 documents:'/documents',documentContent:(id:string)=>`/documents/${encodeURIComponent(id)}/content`,
 obligationEvidence:(id:string)=>`/obligations/${encodeURIComponent(id)}/evidence`,
 obligationReview:(id:string)=>`/obligations/${encodeURIComponent(id)}/review`,
 notifications:'/notifications',notificationRead:(id:string)=>`/notifications/${encodeURIComponent(id)}/read`,
 dashboard:'/dashboard/summary',history:(id:string)=>`/applications/${encodeURIComponent(id)}/history`,
} as const;

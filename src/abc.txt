//return;
                              /* app.dialogs.showSelectDropdownDialog(constant.msg_file_select, constant.fileOptions).then(function ({
                                   buttonId,
                                   selValue
                              }) {
                                   if (buttonId === 'ok') {
                                        const basePath = app.dialogs.showSaveDialog(constant.msg_file_saveas, null, null);
                                        if (basePath != null) {
                                             let dm = app.dialogs;
                                             vDialog = dm.showModalDialog("", constant.titleopenapi, "Please wait untill OpenAPI spec generation is being processed for the \'" + umlPackage.name + "\' package", [], true);
                                             setTimeout(function () {
                                                   const mOpenApi = new openAPI.OpenApi(umlPackage, basePath, options, selValue);

                                                  
                                                  mOpenApi.initUMLPackage().then(function(result){
                                                       console.log("initialize",result);
                                                  }).catch(function(error){
                                                       vDialog.close();
                                                       setTimeout(function () {
                                                            app.dialogs.showErrorDialog(error.message);
                                                            console.error("Error getUMLModel", error);
                                                       }, 10);
                                                  });
                                                       

                                             }, 10);

                                        } else {
                                             console.log("Dialog cancelled : basePath not available")
                                        }
                                   } else {
                                        console.log("Dialog cancelled")
                                   }
                              }); */
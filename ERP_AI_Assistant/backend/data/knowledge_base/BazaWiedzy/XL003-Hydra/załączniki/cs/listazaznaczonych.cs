using System;
using Hydra;
using System.Windows.Forms;
using System.Drawing;
using System.ComponentModel;


[assembly: CallbackAssemblyDescription("lista zaznaczonych",
"lista zaznaczonych",
"Comarch",
"1.0",
"8.0",
"18-07-2008")]


namespace lista_zaznaczonych
{

    [SubscribeProcedure((Procedures)Procedures.ListaDokumentow, "lista_zaznaczonych")]
    public class callbacktestowy : Callback
    {
        int handlowe;
        public override void Init()
        {
            AddSubscription(false, 0, Events.OpenWindow, new TakeEventDelegate(openwindow));
          
                  }
        public bool openwindow(Procedures ProcId, int ControlId, Events Event)
        {
            handlowe = GetWindow().AllChildren["?Handlowe"].Id; 
            ClaWindow button;
            ClaWindow Parent = GetWindow();
            button = Parent.AllChildren.Add(ControlTypes.button);
            button.Visible = true;
            button.TextRaw = "odczytaj";
            button.Bounds = new Rectangle(10, 200, 40, 15);
            AddSubscription(false, button.Id, Events.Accepted, new TakeEventDelegate(lista));

            return true;
        }
        public bool lista(Procedures ProcId, int ControlId, Events Event)
        {
            ADODB._Recordset recordset = Runtime.WindowController.GetQueueMarked((int)ProcId, handlowe, GetCallbackThread());

            try
            {
                int count = recordset.RecordCount;

                if (count == 0)
                    return true;

                recordset.MoveFirst();

                while (recordset.EOF == false)
                {
                    ADODB.Fields fields = recordset.Fields;
                    for (int i = 0; i < fields.Count; i++)
                    {
                        string sName = fields[i].Name;
                        string sValue = fields[i].Value.ToString();
                       
                        if (sName=="NUMER")
                        {
                            Runtime.WindowController.UnlockThread();
                            MessageBox.Show("Gidnumer dokumentu: " + sValue);
                            Runtime.WindowController.LockThread();
                        }
                    }
                    recordset.MoveNext();
                }
            }
            catch (Exception ex)
            {
                Runtime.WindowController.UnlockThread();
                MessageBox.Show("Nie wybrano pozycji");
                Runtime.WindowController.LockThread();
            }

            return true;
        }
        public override void Cleanup()
        {
        }
    }
}

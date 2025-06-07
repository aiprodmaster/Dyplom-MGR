using System;
using Hydra;
using System.Windows.Forms;
using System.Drawing;

[assembly: CallbackAssemblyDescription("KntEdycja", "Przyk豉dowy callback KntEdycja", "ComArch S.A.", "1.0", "7.0", "10-08-2007")]
namespace KntClbk
{
    [SubscribeProcedure((Procedures)Procedures.KntEdycja, "KntEdycja")]

	public class KntClbk:Callback
	{
		public override void Init()
		{
            
            AddFileActionErrSubscription(FileActionTypes.InsertCancel, new FileActionErrDelegate(InsertCancel));
            AddFileActionErrSubscription(FileActionTypes.InitModifier, new FileActionErrDelegate(InitModifier));
            AddFileActionErrSubscription(FileActionTypes.InsertInit, new FileActionErrDelegate(InsertInit));
            AddFileActionErrSubscription(FileActionTypes.InsertAction, new FileActionErrDelegate(InsertAction));
            AddFileActionErrSubscription(FileActionTypes.UpdateCancel, new FileActionErrDelegate(UpdateCancel));
            AddFileActionErrSubscription(FileActionTypes.UpdateInit, new FileActionErrDelegate(UpdateInit));
            AddFileActionErrSubscription(FileActionTypes.UpdateAction, new FileActionErrDelegate(UpdateAction));
            AddFileActionErrSubscription(FileActionTypes.DeleteCancel, new FileActionErrDelegate(DeleteCancel));
            AddFileActionErrSubscription(FileActionTypes.DeleteInit, new FileActionErrDelegate(DeleteInit));
            AddFileActionErrSubscription(FileActionTypes.DeleteAction, new FileActionErrDelegate(DeleteAction));
            AddFileActionErrSubscription(FileActionTypes.CancelModifier, new FileActionErrDelegate(CancelModifier));
			AddSubscription(true,0,Events.OpenWindow,new TakeEventDelegate(OnOpenWindow));			
		}

  
        public  bool InsertCancel(Procedures ProcedureId, GID GID, ADODB._Recordset Attr, int ErrorCode)
        {
            //funkcja wywo造wana przy dodawaniu nowego dokumentu FZ
            Runtime.WindowController.UnlockThread();
            MessageBox.Show("InsertCancel");
            Runtime.WindowController.LockThread();
            return true;


        }
        public bool InsertInit(Procedures ProcedureId, GID GID, ADODB._Recordset Attr, int ErrorCode)
        {
            //funkcja wywo造wana przy dodawaniu nowego dokumentu FZ
            Runtime.WindowController.UnlockThread();
            MessageBox.Show("InsertInit " + ErrorCode.ToString());
            Runtime.WindowController.LockThread();
            return true;
        }
        public bool InsertAction(Procedures ProcedureId, GID GID, ADODB._Recordset Attr, int ErrorCode)
        {
            //funkcja wywo造wana przy dodawaniu nowego dokumentu FZ
            Runtime.WindowController.UnlockThread();
            MessageBox.Show("InsertAction " + ErrorCode.ToString());
            Runtime.WindowController.LockThread();
            return true;
        }
        public bool UpdateCancel(Procedures ProcedureId, GID GID, ADODB._Recordset Attr, int ErrorCode)
        {
            //funkcja wywo造wana przy dodawaniu nowego dokumentu FZ
            Runtime.WindowController.UnlockThread();
            MessageBox.Show("UpdateCancel " + ErrorCode.ToString());
            Runtime.WindowController.LockThread();
            return true;
        }
        public bool UpdateInit(Procedures ProcedureId, GID GID, ADODB._Recordset Attr, int ErrorCode)
        {
            //funkcja wywo造wana przy dodawaniu nowego dokumentu FZ
            Runtime.WindowController.UnlockThread();
            MessageBox.Show("updateInit " + ErrorCode.ToString());
            Runtime.WindowController.LockThread();
            return true;
        }
        public bool UpdateAction(Procedures ProcedureId, GID GID, ADODB._Recordset Attr, int ErrorCode)
        {
            //funkcja wywo造wana przy dodawaniu nowego dokumentu FZ
            Runtime.WindowController.UnlockThread();
            MessageBox.Show("updateAction " + ErrorCode.ToString());
            Runtime.WindowController.LockThread();
            return true;
        }
        public bool DeleteCancel(Procedures ProcedureId, GID GID, ADODB._Recordset Attr, int ErrorCode)
        {
            //funkcja wywo造wana przy dodawaniu nowego dokumentu FZ
            Runtime.WindowController.UnlockThread();
            MessageBox.Show("DeleteCancel " + ErrorCode.ToString());
            Runtime.WindowController.LockThread();
            return true;
        }
        public bool DeleteInit(Procedures ProcedureId, GID GID, ADODB._Recordset Attr, int ErrorCode)
        {
            //funkcja wywo造wana przy dodawaniu nowego dokumentu FZ
            Runtime.WindowController.UnlockThread();
            MessageBox.Show("DeleteInit " + ErrorCode.ToString());
            Runtime.WindowController.LockThread();
            return true;
        }
        public bool DeleteAction(Procedures ProcedureId, GID GID, ADODB._Recordset Attr, int ErrorCode)
        {
            //funkcja wywo造wana przy dodawaniu nowego dokumentu FZ
            Runtime.WindowController.UnlockThread();
            MessageBox.Show("DeleteAction " + ErrorCode.ToString());
            Runtime.WindowController.LockThread();
            return true;
        }
        public bool CancelModifier(Procedures ProcedureId, GID GID, ADODB._Recordset Attr, int ErrorCode)
		{
			//funkcja wywo造wana przy dodawaniu nowego dokumentu FZ
			Runtime.WindowController.UnlockThread();
            MessageBox.Show("CancelModifier " + ErrorCode.ToString());
			Runtime.WindowController.LockThread();
			return true;
		}

        public bool InitModifier(Procedures ProcedureId, GID GID, ADODB._Recordset Attr, int ErrorCode)
		{
			//funkcja wywo造wana przy edycji dokumentu FZ
			Runtime.WindowController.UnlockThread();
            MessageBox.Show("InitModifier " + ErrorCode.ToString());
			Runtime.WindowController.LockThread();
			return true;
		}

		bool OnOpenWindow(Procedures ProcId,int ControlId,Events Event)
		{
			ClaWindow Parent=GetWindow();
            Runtime.WindowController.UnlockThread();
            MessageBox.Show("Formatka");
            Runtime.WindowController.LockThread();
			return true;
		}

		public override void Cleanup()
		{
		}
	}
 
}

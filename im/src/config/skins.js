export const SKIN_KEY = "linuxdo-im-skin";

export const SKINS = {
  dingtalk: {
    label: "钉钉", orgName: "linux.do",
    railWidth: 56, nav2Width: 240, stripWidth: 48, listWidth: 300, titlebarHeight: 40,
    railMin: 64, railMax: 200, listMin: 200, listMax: 420,
    favicon: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAIAAAD8GO2jAAAAAXNSR0IArs4c6QAAAERlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAAIKADAAQAAAABAAAAIAAAAACshmLzAAAHCElEQVRIDZVWW4xeVRVe+3b+29xiL9PpQDvY4SIgODGNpUGKF4i2JdX4QALy1CBPxBhf8EEfmog8kOCDMeFBaUCMD8SUag0iFo0GhWIcbMfWKTLMtLWdybTO5L+esy/Lb5/zzz9TymhcOdnZZ1/W9VtrL8HMzWZTa+2cM8ZgJCIllfPx11prtDKSKHiB3SzTRhMz+UBKt1OntPY+MDGuWG8Tk1hnpZAkcCOUy2VRr9eVUhAjpQwhCCEgABP8asFGi0sNf+oyTy6EmYZYaLEUYkOJPjrId2wUn9isN5XJs7AhXoGMwPFiwQesIEN0Oh3vfbHa21OCtAiTi/zjKffL92m2LslHwWuISfL2Adq3jQ9+XE9skhZiHLQU0LXQEhOoHi2AfwqVC8llJS41/ffets9NiUYmSRHs/XAKMJZrpXDwNvnEJ9VIn25mDlr2DkeGXQuEhHWQXNH0xkX3td+6qUVDGqx5ffYrfHDE0e2b3bN75O7rklbW9XPhdoEIQ2a0i0RJ06uz/uFfu8sdFRX/v8jzhkp4/j7aO1Zq2VUZUQAUhxIlJU7Muwd+ERZTBRQwe/KSENNVi/+HQA68sRxe3ku7tphOiH6NRhQQ0lIstN2jx91iKgWw4MPjd9Kh3QijZQfnAZhMApcwrvsJRYsd+djveaHtNWCaQ1EC6XCREeHpv4ZTV4zADg6S3Nqvv31X34mHaj/8vNw5jOSAVAnoEHC8/ofrpxb103+jBOBQCvgUaZpScNPLfPcRWrYxC8AgeDqwwx/ZXysinAV/fM4ePu1emePlloKU6Lro1w8jpj7t3/iyvGlIsFDRAqPl4TNhOY2qAcMINyL8h4v8r0bMalAi1RfGyj/7Yu3tB8tPfpomhr0SMAiQL85fPUpRz9RzZ5xRIlrQabeaNtx1VEwvawEf5LEBU3b0+B3+yV2mLzG5lNUh8/7EvD0y44+9H04vKZQJKLQ2VRCxGwf9mweoqoVIO+23FvxnfiUczF5lAgk0UrG7N/POYXnvqL5tQ6mG8FxNTet/dyH7wUn/ynkAb3UXaioOx/f63VuMVOxPXgFSkORXEdJu/5j80edqu4b1P66En083Xj/XOFdPM5S5FaoZtW+scmx/5bFbgTQ4uEtg5YM6vYS6AThpM9eK2msVI9zzEWrPby4IF+ie0TKNgiU3LLes76DoqmRV2xhvdfsGoEvq6Ci4J/JJA71XJySBDNY2sygZ7lr7oSLNNvW33syibpFEn5Gbq2agdBV3bLRd+MlZTrQ00BKIj6MQSnSCCh4WKAXJcGHu4Z4B0Zg+LV94Vyxl6Z4RlGixscLDFRqtyaGSgUK51Di8OJ1OLuqy7t3FGvhzBDOYM4cBw0YoXCoglB/EAGJA7eis2rnJ7tmqP1LWg0aWYOYa7kja758UZahfgDbei8pZQUMlFAABATQ+IBJF4JUzLcaeOqJK6uxy+PqQBiDyA1FwziVOnnknO9dMqqi7Bb4hOzIQCfP4gCxcpD82aPs1+Tw42MxpVVhZ0UszZr6dPTEhxwf136/49+r+qzdCafHnS+kL0zSYoFbFDFqRGuXDKzf3u+iXRr2Oivel19TUUv72FvyvGVNPFeWHSnShIfdtd4c/W8aRc/VssUNHZ9yzZ0p6peiCuwvi1iH38n0Oj4zWxiTk917nTy3hAb6G8cqCxlNPciklLfneUZxDJabr+xMbsqOzBsjJQd49bZke2OarMmQAFNoIPKdfuYG3ViBYxHxb58MWntiKES++Kx96zV1sOWTyN/7E86kxCo1EvIgzYDJa9Qeu947zlxiQ8NClSo/e4i3SF2/Mf/0g48yyudgmoPapSfuXy0nFcO8WJo754M12bEB62JgjNWIDRjx8g98z7FPEq4AwAciorXltjnNM4gomSNe7R/jVOf/Tsxr4iSv5MYyp53u22Ed2YBLbC7w0sVxHI9AcGHXoznS8zzkf0wQ+jR/KlsCHeTHGSUVRSdinJpGhsb70jqGu3DTgvzvhITVAUSk9eOHBiVUbTVIIgN7Uv/033zL/bBhwWY9gYk3ZJZsogDO+HpHannb0u2c+ZW8ZFJmPK7AArdgHO7uyFrN1f+id5I/zCB3ar3j0WkKz2CvPjimDZ4b9dybctmosc2ANjQulRavV+sB9dKIdzy/NyufPqvNtBFVg5VpBBd4R0tGKe2TcPTjGiYrVF1QI6Ippt9tr/zHHCbBLJM+35bEL/vVLZnpZNq1EqmOvkAQv9WuGT+4fDfePhJEa3IJXtNs0Fhp3BfSaX1hULHVVQIw4oFlqO55r8ExLnW+GutWo3kMJo6aOVe32AVWSjC4rttcr7XO8l1PXRUg0xBktBiYYi/a02Cv6DlyIZQCV3WgGHOJ9dM3Avu5YV/S10WhAEWdiN++L9h2TJEn+A/UW4FHnQZ2dAAAAAElFTkSuQmCC",
    avatarColors: ["#1A87FF", "#2F88FF", "#F3A23A", "#8B6CFF",
      "#00C56C", "#FF9F0A", "#5B4BFF", "#EF4444"]
  },
  feishu: {
    label: "飞书", orgName: "linux.do",
    railWidth: 230, nav2Width: 240, stripWidth: 48, listWidth: 360, titlebarHeight: 40,
    railMin: 180, railMax: 480, listMin: 280, listMax: 640,
    favicon: "data:image/x-icon;base64,AAABAAEAMDAAAAEAIACoJQAAFgAAACgAAAAwAAAAYAAAAAEAIAAAAAAAACQAABMLAAATCwAAAAAAAAAAAAD///8A////AP///wf///8U////W////4f///+J////if///4n///+J////if///4n///+J////if///4n///+J////if///4n///+J////if///4n///+J////if///4n///+J////if///4n///+J////if///4n///+J////if///4n///+J////if///4n///+J////if///4n///+J////if///4n///+G////T////yL///8J////AP///wD///8B////D////2n////R////9P////n////5////+f////n////5////+f////n////5////+f////n////5////+f////n////5////+f////n////5////+f////n////5////+f////n////5////+f////n////5////+f////n////5////+f////n////5////+f////n////5////+f////n////5////9f///+D///92////EP///wH///8N////hv////L////9//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////7////z////hv///wr///9T////8f//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////8P///zj///+s////+v//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////+v///6v////x/////v///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////v////H///////////////////////////////////////////////////////////////////////////////////////39///7+f//+vj///v5///9/P///f3////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////9/P//9/P//+/p///s5P//59z//9jI///KtP//ybP//8q0///Xx///2cn//+je///s5P//8uz///f0///+/v//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////9vL//+vj///VxP//uJr//5Vp//+FUv//cjX//3Az//9wM///cDP//3Az//9wM///cDT//3g+//+GU///onv//7mc///dz///7OP///n3//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////Ls///k2f//t5j//4xc//9xNf//bzL//3Ay//9wM///cDP//3Az//9wM///cDP//3Az//9wM///cDP//3Az//9wM///cDL//3Az//93Pf//jV3//8Sr///n3P//9/P////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////08P//4dX//6eD//9+SP//cDP//3Ay//9wM///cDP//3Az//9wM///cDP//3Az//9wM///cDP//3Az//9wM///cDP//3Az//9wM///cDP//3Az//9wM///cDL//3Az//+FUf//u57//+bc///6+P///////////////////////////////////////////////////////////////////////////////////////////////////v7//+7n//+zk///fkj//3Ay//9wM///cDP//3Az//9wM///cDP//3Az//9wM///cDP//3Az//9wM///cDP//3Az//9wM///cDP//3Az//9wM///cDP//3Az//9wM///cDP//3Az//9wMv//cDP//4ta///Hr///8Or/////////////////////////////////////////////////////////////////////////////////////////////+/n//7KR//9yNv//cDL//3Az//9wM///cDP//3Az//9wM///cDP//3Az//9wM///cDP//3Az//9wM///cDP//3Az//9wM///cDP//3Az//9wM///cDP//3Az//9wM///cDP//3Az//9wM///cDP//28y//9xNf//qof//+bc///9/f//////////////////////////////////////////////////////////////////////////////////+PX//41c//9xNf//cDP//3Az//9wM///cDP//3Az//9wM///cDP//3Az//9wM///cDP//3Az//9wM///cDP//3Az//9wM///cDP//3Az//9wM///cDP//3Az//9wM///cDP//3Az//9wM///cDP//3Az//9wM///cDP//5Zq///Xxv///fz/////////////////////////////////////////////////////////////////////////////+PX//4hV//9xNP//cDP//3Az//9wM///cDP//3Az//9wM///cDP//3Az//9wM///cDP//3Az//9wM///cDP//3Az//9wM///cDP//3Az//9wM///cDP//3Az//9wM///cDP//3Az//9xM///cTT//3E0//9xNP//cTT//3Ez//+FT///1MH///z7////////////////////////////////////////////////////////////////////////+PX//4hV//9xNP//cDP//3Az//9wM///cDP//3Az//9wM///cDP//3Az//9wM///cDP//3Az//9wM///cDP//3Az//9wM///cDP//3Az//9wM///cDP//3Az//9xM///cDP/92ww/+xmLf/lYyv/32Ap/99gKf/hYSr/6GQs//FpL//+g07//9XD///+/v//////////////////////////////////////////////////////////////////+PX//4hV//9xNP//cDP//3Az//9wM///cDP//3Az//9wM///cDP//3Az//9wM///cDP//3Az//9wM///cDP//3Az//9wM///cDP//3Az//9xNP//cTP/9Gov/+hkLP/YXCf/x1Mh/7JIGv+kQRb/mDsS/5c7Ev+cPRT/qEQY/7tNHf/aXSj/74BS///l2f//////////////////////////////////////////////////////////////////+PX//4hV//9xNP//cDP//3Az//9wM///cDP//3Az//9wM///cDP//3Az//9wM///cDP//3Az//9wM///cDP//3Az//9vMv//cTP//G4y/+plLP/eXyn/wlAg/6xFGf+YOxL/mDsS/5k7E/+ZPBP/mjwT/5o8E/+aPBP/mTwT/5k7E/+dPRT/uk4f/+GOa//96eD///7+////////////////////////////////////////////////////////+PX//4hV//9xNP//cDP//3Az//9wM///cDP//3Az//9wM///cDP//3Az//9wM///cDP//3Az//9wM///bzH//20v//t0Ov/hXib/z1Yj/7BHGv+fPhX/mDsS/5k7E/+aPBP/mjwT/5o8E/+aPBP/mjwT/5o8E/+aPBP/mjwT/5o8E/+aPBP/mTsS/6VDGP/am3///vXy////////////////////////////////////////////////////////+PX//4hV//9xNP//cDP//3Az//9wM///cDP//3Az//9wM///cDP//3Az//9wM///cDP//28y//9uMP//fET//5pv//i0lf/FfFz/nkch/5g6EP+ZPBP/mjwT/5o8E/+aPBP/mjwT/5o8E/+aPBP/mjwT/5o8E/+aPBP/mjwT/5o8E/+aPBP/mjwT/5o8FP+mTyn/6cq+//79/f//////////////////////////////////////////////////+PX//4hV//9xNP//cDP//3Az//9wM///cDP//3Az//9wM///cDP//3Az//9wMv//bjD//3U6//+VZ///wqj//+3l//7////x5eD/0KSR/6xfPf+ZOhH/mjsS/5o8E/+aPBP/mjwT/5o8E/+aPBP/mjwT/5o8E/+aPBP/mjwT/5o8E/+aPBP/mjwT/5o8E/+bPhb/t3ZZ//fx7v//////////////////////////////////////////////////+PX//4hV//9xNP//cDP//3Az//9wM///cDP//3Az//9wM///cDP//28y//9yNv//j17//7qd///k2P///////////////////////////+DFt/+4d1v/nEAY/5o7E/+aPBP/mjwT/5o8E/+aPBP/mjwT/5o8E/+aPBP/mjwT/5o8E/+aPBP/mjwT/5o8E/+aPBP/nEAY/9u5qv/9/Pv/////////////////////////////////////////////+PX//4hV//9xNP//cDP//3Az//9wM///cDP//3Az//9wM///bzH//39I//+ujP//28z////////////////////////////////////////////v4Nr/w4xw/51FGP+aPBP/mjwT/5o8E/+aPBP/mjwT/5o8E/+aPBP/mjwT/5o8E/+aPBP/mjwT/5o8E/+aPBP/mz4V/7BmRv/37+v////+////////////////////////////////////////+PX//4hV//9xNP//cDP//3Az//9wM///cDP//28y//9uMP//kmP//8my///39P////////////////////////////////////////////////////7/5OOn/6yJE/+cRRL/mjwT/5o8E/+aPBP/mjwT/5o8E/+aPBP/mjwT/5o8E/+aPBP/mjwT/5o8E/+aPBP/mjwT/5xBGf/Ztqb//fz7////////////////////////////////////////+PX//4hV//9xNP//cDP//3Az//9wM///bzL//3g///+vjf//3tD//////////////////////////////////////////////////////////v/5/Ov/zeNL/7jOBf+qign/nEUS/5o8E/+aPBP/mjwT/5o8E/+aPBP/mjwT/5o8E/+aPBP/mjwT/5o8E/+aPBP/mjwT/5s+Ff+uY0L/9u7q/////v//////////////////////////////////+PX//4hV//9xNP//cDP//3Az//9vMf//gkz//7uf///49f////////////////////////////////////////////////////////////7+/P/f7Iv/vNgL/7nWAP+3zgH/qowJ/5xGEv+aPBP/mjwT/5o8E/+aPBP/mjwT/5o8E/+aPBP/mjwT/5o8E/+aPBP/mjwT/5o8E/+cQBj/17Kh//38+///////////////////////////////////+PX//4hV//9xNP//cDP//3Ay//+SY///z7v///j2/////////////////////////////////////////////////////////////v/9/+31v//B2yD/udYB/7nWAP+51gD/t84B/6uPCf+cRhL/mjsT/5o8E/+aPBP/mjwT/5o8E/+aPBP/mjwT/5o8E/+aPBP/mjwT/5o8E/+bPhX/rWA///bv6/////7/////////////////////////////+PX//4hV//9xNP//cDP//5lt///dzv////////////////////////////////////////////////////////////////////7/+fzp/83iSf+61gL/udYA/7nWAP+51gD/udYA/7fOAf+rkQj/nUsR/5o6E/+aPBP/mjwT/5o8E/+aPBP/mjwT/5o8E/+aPBP/mjwT/5o8E/+aPBP/mz8W/8eUff/9/Pv/////////////////////////////+PX//4hV//9xNP//mm///+LV///////////////////////////////////////////////////////////////////////+//z/3OuB/7vXCf+51gD/udYA/7nWAP+51gD/udYA/7nWAP+4zwH/rp4H/6NoDf+bPxL/mjoT/5o8E/+aPBP/mjwT/5o8E/+aPBP/mjwT/5o8E/+aPBP/mjwT/6BHIf/fwbT//vz8////////////////////////+PX//4hV//+dc///49f//////////////////////////////////////////////////////////////////////////f/n8af/wNob/7nWAf+51gD/udYA/7nWAP+51gD/udYA/7nWAP+51gD/udQA/7S7BP+vmhH/o2kN/5o/D/+YNw3/mDgO/5k5D/+ZOhD/mToQ/5k5D/+YOA7/mDgO/6BHIf/CinH/+PHu/////v//////////////////+/r//8Cm///m3P///////////////////////////////////////////////////////////////////////v/9/+31wP/F3Sv/udYA/7nWAP+51gD/udYA/7nWAP+51gD/udYA/7nWAP+51gD/udYA/7nYAP+61gb/tb0H/8GtS//JmH7/vYBl/7VvUf+wZ0j/sGdI/7VvUf+9gGX/ypmE/9/BtP/p1Mv//Pj3/////////////////////////v7///bz//////////////////////////////////////////////////////////////////////////7/9vnd/8vhRP+51gH/udYA/7nWAP+51gD/udYA/7nWAP+51gD/udYA/7nWAP+51gD/udYA/7nWAP+51gD/vNkI/+XyoP/38uv/8uXg/+3c1f/q2ND/6tjQ/+3c1f/y5eD/+fLw///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////4++f/0uRb/7vXBv+51gD/udYA/7nWAP+51gD/udYA/7nWAP+51gD/udYA/7nWAP+51gD/udYA/7nWAP+51gD/vtkU//f64f////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////j75v/S5V3/u9gK/7nWAP+51gD/udYA/7nWAP+51gD/udYA/7nWAP+51gD/udYA/7nWAP+51gD/udYA/7nWAP+61wX/0+Vg//3+9///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////+Pvl/9HkWf+71wn/udYA/7nWAP+51gD/udYA/7nWAP+51gD/udYA/7nWAP+51gD/udYA/7nWAP+51gD/udYA/7nWAP+82An/8PbJ//7//f///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////v/3++T/0ORW/7vXCf+51gD/udYA/7nWAP+51gD/udYA/7nWAP+51gD/udYA/7nWAP+51gD/udYA/7nWAP+51gD/udYA/7rXBP/Q41b//P3z//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////f74//P41L/u9cI/7nWAP+51gD/udYA/7nWAP+51gD/udYA/7nWAP+51gD/udYA/7nWAP+51gD/udYA/7nWAP+51gD/udYB/77aFf/w98r//v/9///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////+//3/7fW//8vgQv+71wf/udYA/7nWAP+51gD/udYA/7nWAP+51gD/udYA/7nWAP+51gD/udYA/7nWAP+51gD/udYA/7nWAP+51gD/u9cG/9jpdP/9/vb///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////7++//j75n/xNwn/7rWAv+51gD/udYA/7nWAP+51gD/udYA/7nWAP+51gD/udYA/7nWAP+51gD/udYA/7nWAP+51gD/udYA/7nWAP+61gP/yN85//f64f////7///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////7/+vzr/9jocv/A2hn/udYA/7nWAP+51gD/udYA/7nWAP+51gD/udYA/7nWAP+51gD/udYA/7nWAP+51gD/udYA/7nWAP+51gD/udYA/7nWAf/D2yL/8PfI/////f///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////f75/+z0uv/l75//5e+f/+Xvn//l75//5e+f/+Xvn//l75//5e+f/+Xvn//l75//5e+f/+Xvn//l75//5e+f/+Xvn//l75//5e+f/+bwov/1+dn//v/8//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////3++f/9/vf//f73//3+9//9/vf//f73//3+9//9/vf//f73//3+9//9/vf//f73//3+9//9/vf//f73//3+9//9/vf//f73//3+9//////////////////////////////////////////////////////////////////////////////////////////////////////x/////v///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////v////H///+s////+v//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////+v///6z///85////8P//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////8f///1L///8K////hf////P////+//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////3////y////hf///w3///8B////EP///3b////g////9f////n////5////+f////n////5////+f////n////5////+f////n////5////+f////n////5////+f////n////5////+f////n////5////+f////n////5////+f////n////5////+f////n////5////+f////n////5////+f////n////5////+f////n////5////9f///9L///9o////D////wH///8A////AP///wn///8i////T////4b///+J////if///4n///+J////if///4n///+J////if///4n///+J////if///4n///+J////if///4n///+J////if///4n///+J////if///4n///+J////if///4n///+J////if///4n///+J////if///4n///+J////if///4n///+J////if///4n///+H////W////xT///8H////AP///wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=",
    avatarColors: ["#3370FF", "#14B8A6", "#FF6F39", "#7B61FF",
      "#22C55E", "#00B4D8", "#F59E0B", "#EF4444"]
  },
  wecom: {
    label: "企业微信", orgName: "企业微信",
    railWidth: 162, nav2Width: 240, stripWidth: 0, listWidth: 304, titlebarHeight: 0,
    railMin: 100, railMax: 260, listMin: 240, listMax: 480,
    favicon: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2NCA2NCI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJhIiB4MT0iOCIgeTE9IjQiIHgyPSI1NiIgeTI9IjYwIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHN0b3Agc3RvcC1jb2xvcj0iIzQwOTZmZiIvPjxzdG9wIG9mZnNldD0iMSIgc3RvcC1jb2xvcj0iIzE3NjlkMiIvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjxyZWN0IHdpZHRoPSI2NCIgaGVpZ2h0PSI2NCIgcng9IjE1IiBmaWxsPSJ1cmwoI2EpIi8+PHBhdGggZmlsbD0iI2ZmZiIgZD0iTTExIDI3LjVDMTEgMTguOTQgMTguODQgMTIgMjguNSAxMlM0NiAxOC45NCA0NiAyNy41IDM4LjE2IDQzIDI4LjUgNDNjLTIuMTMgMC00LjE3LS4zNC02LjA2LS45NUwxNCA0N2wyLjQ4LTcuMTZDMTMuMSAzNi45MSAxMSAzMi41NSAxMSAyNy41WiIvPjxwYXRoIGZpbGw9IiMxOWM4NzgiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIyLjUiIGQ9Ik0zNCAzNy41QzM0IDMwLjYgNDAuMjcgMjUgNDggMjVzMTQgNS42IDE0IDEyLjVTNTUuNzMgNTAgNDggNTBjLTEuNTUgMC0zLjA0LS4yMy00LjQzLS42NUwzNyA1M2wxLjg0LTUuMjNDMzUuODcgNDUuMzkgMzQgNDEuNzMgMzQgMzcuNVoiLz48Y2lyY2xlIGN4PSIyMyIgY3k9IjI3IiByPSIyIiBmaWxsPSIjMjY3ZWYwIi8+PGNpcmNsZSBjeD0iMzMiIGN5PSIyNyIgcj0iMiIgZmlsbD0iIzI2N2VmMCIvPjxjaXJjbGUgY3g9IjQ0IiBjeT0iMzcuNSIgcj0iMS43IiBmaWxsPSIjZmZmIi8+PGNpcmNsZSBjeD0iNTIiIGN5PSIzNy41IiByPSIxLjciIGZpbGw9IiNmZmYiLz48L3N2Zz4=",
    avatarColors: ["#1A87FF", "#2F88FF", "#F3A23A", "#8B6CFF",
      "#00C56C", "#FF9F0A", "#5B4BFF", "#EF4444"]
  }
};

// 旧版单皮肤脚本（钉钉/飞书独立版）偏好一次性迁移到统一 key
export function migratePrefs() {
  try {
    if (localStorage.getItem(SKIN_KEY)) return;
    let skin = null;
    if (
      localStorage.getItem("linuxdo-dingtalk-view") ||
      localStorage.getItem("linuxdo-dingtalk-color-theme") ||
      localStorage.getItem("linuxdo-dingtalk-org-name")
    ) skin = "dingtalk";
    else if (
      localStorage.getItem("linuxdo-feishu-view") ||
      localStorage.getItem("linuxdo-feishu-dark")
    ) skin = "feishu";
    skin = skin || "dingtalk";
    const copy = (from, to, map) => {
      const v = localStorage.getItem(from);
      if (v == null) return;
      localStorage.setItem(to, map ? map(v) : v);
    };
    copy("linuxdo-dingtalk-view", "linuxdo-im-view");
    copy("linuxdo-feishu-view", "linuxdo-im-view");
    copy("linuxdo-dingtalk-color-theme", "linuxdo-im-color-theme");
    copy("linuxdo-feishu-dark", "linuxdo-im-color-theme", (v) => (v === "1" ? "dark" : "light"));
    copy("linuxdo-dingtalk-last-read", "linuxdo-im-last-read");
    copy("linuxdo-feishu-last-read", "linuxdo-im-last-read");
    copy("linuxdo-dingtalk-mask-avatar", "linuxdo-im-mask-avatar");
    copy("linuxdo-feishu-mask-avatar", "linuxdo-im-mask-avatar");
    copy("linuxdo-dingtalk-mask-title", "linuxdo-im-mask-title");
    copy("linuxdo-dingtalk-hide-cat-tags", "linuxdo-im-hide-cat-tags");
    copy("linuxdo-dingtalk-nav2", "linuxdo-im-nav2");
    copy("linuxdo-feishu-nav2", "linuxdo-im-nav2");
    copy("linuxdo-dingtalk-list-nav", "linuxdo-im-list-nav");
    copy("linuxdo-feishu-list-nav", "linuxdo-im-list-nav");
    copy("linuxdo-dingtalk-rail-width", "linuxdo-im-rail-width");
    copy("linuxdo-feishu-nav-w", "linuxdo-im-rail-width");
    copy("linuxdo-dingtalk-list-width", "linuxdo-im-list-width");
    copy("linuxdo-feishu-list-w", "linuxdo-im-list-width");
    copy("linuxdo-dingtalk-org-name", "linuxdo-im-org-name");
    copy("linuxdo-dingtalk-org-icon", "linuxdo-im-org-icon");
    localStorage.setItem(SKIN_KEY, skin);
  } catch { /* ignore */ }
}

export function currentSkinId() {
  try {
    const v = localStorage.getItem(SKIN_KEY);
    if (v && SKINS[v]) return v;
  } catch { /* ignore */ }
  return "dingtalk";
}

export const SKIN_ID = currentSkinId();

/* ---- 皮肤派生量 ---- */
export let RAIL_WIDTH = SKINS[SKIN_ID].railWidth;
export let NAV2_WIDTH = SKINS[SKIN_ID].nav2Width;
export let STRIP_WIDTH = SKINS[SKIN_ID].stripWidth;
export let LIST_WIDTH = SKINS[SKIN_ID].listWidth;
export let TITLEBAR_HEIGHT = SKINS[SKIN_ID].titlebarHeight;
export let RAIL_W_MIN = SKINS[SKIN_ID].railMin;
export let RAIL_W_MAX = SKINS[SKIN_ID].railMax;
export const RAIL_W_COMPACT = 80;
export let LIST_W_MIN = SKINS[SKIN_ID].listMin;
export let LIST_W_MAX = SKINS[SKIN_ID].listMax;
export const FAVICON_URI = SKINS[SKIN_ID].favicon;
export let AVATAR_COLORS = SKINS[SKIN_ID].avatarColors;

export function defaultOrgName() {
  return SKINS[SKIN_ID].orgName || "linux.do";
}

/** 最左栏装饰项（按皮肤取值；均不可点击；仅「消息」带未读红点） */
export let RAIL_DECO_ITEMS = SKIN_ID === "feishu"
  ? [
    { key: "calendar", icon: "calendar", label: "日历" },
    { key: "worktable", icon: "worktable", label: "工作台" },
    { key: "cloud", icon: "cloud", label: "云文档" },
    { key: "wiki", icon: "wiki", label: "知识库" },
    { key: "task", icon: "task", label: "任务" },
    { key: "contacts", icon: "contacts", label: "联系人" },
    { key: "project", icon: "project", label: "项目" },
    { key: "more", icon: "more", label: "更多" }
  ]
  : SKIN_ID === "wecom"
  ? [
    // 官方企业微信文案（与实机对齐）；下半区六项按实机截图
    { key: "smartdoc", icon: "file", label: "智能文档", dot: true },
    { key: "summary", icon: "spark", label: "智能总结" },
    { key: "work", icon: "work", label: "工作台" },
    { key: "book", icon: "book", label: "通讯录" },
    { key: "disk", icon: "disk", label: "微盘" },
    { key: "advanced", icon: "apps", label: "高级功能" }
  ]
  : [
    { key: "doc", icon: "doc", label: "文档" },
    { key: "aitable", icon: "aitable", label: "AI表格" },
    { key: "aimic", icon: "aimic", label: "AI听记" },
    { key: "work", icon: "work", label: "工作台" },
    { key: "book", icon: "book", label: "通讯录" },
    { key: "meet", icon: "meet", label: "会议" },
    { key: "cal", icon: "cal", label: "日历" },
    { key: "todo", icon: "todo", label: "待办" },
    { key: "add", icon: "plus", label: "添加" }
  ];

/** 检测旧版单皮肤脚本，互斥避让 */
export function otherThemeActive() {
  return !!document.getElementById("linuxdo-dingtalk-theme") ||
    !!document.getElementById("linuxdo-feishu-theme") ||
    document.documentElement.classList.contains("dingtalk-im-theme") ||
    document.documentElement.classList.contains("feishu-im-theme");
}

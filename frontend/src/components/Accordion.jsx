import React from "react";

const Accordion = () => {
  return (
    <>
      <div className="alert col-12 alert-success alert-shade-white bd-side alert-dismissible fade show"
        role="alert">
        <strong>هشدار!</strong>این یک متن هشدار است.
      </div>

      <div id="accordion" className="accordion card shade outlined o-forth w-100">
        <div className="">
          <div className="card-header mr-3 ml-3 pr-0 pl-0" id="headingOne">
            <h5 className="mb-0">
              <button className="btn btn-link c-grey w-100 m-0 text-right" data-toggle="collapse"
                data-target="#collapseOne" aria-expanded="true" aria-controls="collapseOne">
                عنوان شماره یک
                <i className="fas fa-chevron-right"></i>
              </button>
            </h5>
          </div>

          <div id="collapseOne" className="collapse show" aria-labelledby="headingOne"
            data-parent="#accordion">
            <div className="card-body">
              لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ، و با استفاده از
              طراحان گرافیک است، چاپگرها و متون بلکه روزنامه و مجله در ستون و سطرآنچنان که
              لازم است، و برای شرایط فعلی تکنولوژی مورد نیاز، و کاربردهای متنوع با هدف بهبود
              ابزارهای کاربردی می باشد، کتابهای زیادی در شصت و سه درصد گذشته حال و آینده،
              شناخت فراوان جامعه و متخصصان را می طلبد، تا با نرم افزارها شناخت بیشتری را برای
              طراحان رایانه ای علی الخصوص طراحان خلاقی، و فرهنگ پیشرو در زبان فارسی ایجاد کرد،
              در این صورت می توان امید داشت که تمام و دشواری موجود در ارائه راهکارها، و شرایط
              سخت تایپ به پایان رسد و زمان مورد نیاز شامل حروفچینی دستاوردهای اصلی، و جوابگوی
              سوالات پیوسته اهل دنیای موجود طراحی اساسا مورد استفاده قرار گیرد.
            </div>
          </div>
        </div>

        <div className="">
          <div className="card-header mr-3 ml-3 pr-0 pl-0" id="headingTwo">
            <h5 className="mb-0">
              <button className="btn btn-link c-grey collapsed w-100 m-0 text-right"
                data-toggle="collapse" data-target="#collapseTwo" aria-expanded="false"
                aria-controls="collapseTwo">
                عنوان شماره دو
                <i className="fas fa-chevron-right"></i>
              </button>
            </h5>
          </div>
          <div id="collapseTwo" className="collapse" aria-labelledby="headingTwo"
            data-parent="#accordion">
            <div className="card-body">
              لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ، و با استفاده از
              طراحان گرافیک است، چاپگرها و متون بلکه روزنامه و مجله در ستون و سطرآنچنان که
              لازم است، و برای شرایط فعلی تکنولوژی مورد نیاز، و کاربردهای متنوع با هدف بهبود
              ابزارهای کاربردی می باشد، کتابهای زیادی در شصت و سه درصد گذشته حال و آینده،
              شناخت فراوان جامعه و متخصصان را می طلبد، تا با نرم افزارها شناخت بیشتری را برای
              طراحان رایانه ای علی الخصوص طراحان خلاقی، و فرهنگ پیشرو در زبان فارسی ایجاد کرد،
              در این صورت می توان امید داشت که تمام و دشواری موجود در ارائه راهکارها، و شرایط
              سخت تایپ به پایان رسد و زمان مورد نیاز شامل حروفچینی دستاوردهای اصلی، و جوابگوی
              سوالات پیوسته اهل دنیای موجود طراحی اساسا مورد استفاده قرار گیرد.
            </div>
          </div>
        </div>

        <div className="">
          <div className="card-header mr-3 ml-3 pr-0 pl-0" id="headingThree">
            <h5 className="mb-0">
              <button className="btn btn-link c-grey collapsed w-100 m-0 text-right"
                data-toggle="collapse" data-target="#collapseThree" aria-expanded="false"
                aria-controls="collapseThree">
                عنوان شماره سه
                <i className="fas fa-chevron-right"></i>
              </button>
            </h5>
          </div>
          <div id="collapseThree" className="collapse" aria-labelledby="headingThree"
            data-parent="#accordion">
            <div className="card-body">
              لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ، و با استفاده از
              طراحان گرافیک است، چاپگرها و متون بلکه روزنامه و مجله در ستون و سطرآنچنان که
              لازم است، و برای شرایط فعلی تکنولوژی مورد نیاز، و کاربردهای متنوع با هدف بهبود
              ابزارهای کاربردی می باشد، کتابهای زیادی در شصت و سه درصد گذشته حال و آینده،
              شناخت فراوان جامعه و متخصصان را می طلبد، تا با نرم افزارها شناخت بیشتری را برای
              طراحان رایانه ای علی الخصوص طراحان خلاقی، و فرهنگ پیشرو در زبان فارسی ایجاد کرد،
              در این صورت می توان امید داشت که تمام و دشواری موجود در ارائه راهکارها، و شرایط
              سخت تایپ به پایان رسد و زمان مورد نیاز شامل حروفچینی دستاوردهای اصلی، و جوابگوی
              سوالات پیوسته اهل دنیای موجود طراحی اساسا مورد استفاده قرار گیرد.
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Accordion;